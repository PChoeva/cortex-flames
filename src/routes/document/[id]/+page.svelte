<script lang="ts">
    import type { PageData } from './$types';
    import type { ContentType } from '$lib/constants';
    import { invalidateAll } from '$app/navigation';
    import { modalDialog } from '$lib/stores/modal';

    export let data: PageData;
    let { document, contents } = data;

    let processingText = false;
    let processingSummary = false;
    let processingQuiz = false;
    let error: string | null = null;
    let isTextExpanded = false;

    function getContent(type: ContentType) {
        return contents.find(c => c.type === type);
    }

    async function checkProcessingStatus(documentId: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/document/${documentId}/status`);
            if (!response.ok) {
                throw new Error('Failed to check processing status');
            }
            const data = await response.json();
            return data.status === 'completed';
        } catch (e) {
            console.error('Status check error:', e);
            return false;
        }
    }

    async function pollForCompletion<T>(
        checkFn: () => Promise<T>,
        isComplete: (result: T) => boolean,
        interval = 1000,
        timeout = 120000 // 2 minute timeout
    ): Promise<T> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            await new Promise(resolve => setTimeout(resolve, interval));
            const result = await checkFn();
            
            if (isComplete(result)) {
                return result;
            }
        }
        
        throw new Error('Operation timed out');
    }

    async function processDocument(type: ContentType) {
        if (type === 'summary') {
            processingSummary = true;
        }
        
        try {
            error = null;
            const response = await fetch(`/api/document/${document.id}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) {
                throw new Error('Failed to process document');
            }

            await pollForCompletion(
                async () => {
                    const statusResponse = await fetch(`/api/document/${document.id}/status`);
                    return statusResponse.json();
                },
                (statusData) => statusData.status === 'completed'
            );

            // Force a page reload to get fresh data
            window.location.reload();
            
            // Or alternatively, use goto with a cache-busting parameter
            // await goto(`/document/${document.id}?t=${Date.now()}`, { invalidateAll: true });

        } catch (e) {
            console.error('Processing error:', e);
            error = e instanceof Error ? e.message : 'Failed to process document';
        } finally {
            processingSummary = false;
        }
    }

    async function handleQuizGeneration() {
        try {
            processingQuiz = true;
            const response = await fetch(`/api/document/${document.id}/quiz`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to start quiz generation: ${response.status}`);
            }

            const data = await response.json();
            
            await pollForCompletion(
                async () => {
                    const statusResponse = await fetch(`/api/quiz/${data.quizId}/status`);
                    return statusResponse.json();
                },
                (statusData) => statusData.status === 'completed' || statusData.status === 'failed'
            );

            await invalidateAll();
        } catch (e) {
            console.error('Quiz generation error:', e);
            error = e instanceof Error ? e.message : 'Failed to generate quiz';
        } finally {
            processingQuiz = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-semibold text-gray-800">{document.filename}</h1>
            </div>

            <!-- Error Message -->
            {#if error}
                <div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error}</div>
            {/if}

            <!-- Processing Actions -->
            <div class="flex flex-col gap-4">
                {#if document.mimeType !== 'text/plain'}
                    <div class="flex items-center gap-3">
                        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-semibold">1</span>
                        <button
                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                                   disabled:opacity-50 transition-colors duration-200 flex items-center gap-2 flex-1"
                            on:click={() => processDocument('raw_text')}
                            disabled={processingText || document.processingStatus === 'processing'}>
                            {#if processingText && !getContent('raw_text')}
                                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            {/if}
                            Extract Text
                        </button>
                        {#if getContent('raw_text')}
                            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Original File -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="border-b border-gray-100 p-4">
                    <h2 class="text-lg font-medium text-gray-800">Original File</h2>
                </div>
                <pre class="p-4 text-sm text-gray-700 font-mono bg-gray-50 overflow-auto max-h-[600px]">
                    {document.content || 'File preview not available'}
                </pre>
            </div>

            <!-- Processed Content -->
            <div class="space-y-6">
                <!-- Extracted Text -->
                {#if getContent('raw_text')}
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                        <button 
                            class="w-full p-4 text-left font-medium text-gray-800 hover:bg-gray-50 
                                   transition-colors duration-200 flex justify-between items-center
                                   border-b border-gray-100"
                            on:click={() => isTextExpanded = !isTextExpanded}
                        >
                            <span>Extracted Text</span>
                            <svg class="w-5 h-5 text-gray-400 transform transition-transform duration-200
                                      {isTextExpanded ? 'rotate-180' : ''}" 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div class="transition-all duration-300 ease-in-out overflow-hidden"
                             style="max-height: {isTextExpanded ? '600px' : '100px'}">
                            <pre class="p-4 text-sm text-gray-700 font-mono">
                                {getContent('raw_text')?.content}
                            </pre>
                        </div>
                    </div>
                {/if}

                <!-- Overview section -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="border-b border-gray-100 p-4 flex justify-between items-center">
                        <div>
                            <h2 class="text-lg font-medium text-gray-800">Overview</h2>
                            <p class="text-sm text-gray-500 mt-1">AI-generated summary of the document</p>
                        </div>
                        <button 
                            class="text-sm px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-2"
                            on:click={() => processDocument('summary')}
                            disabled={processingSummary || document.processingStatus === 'processing' || 
                                     (document.mimeType !== 'text/plain' && !getContent('raw_text'))}
                        >
                            {#if processingSummary}
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            {:else}
                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            {/if}
                            {#if getContent('summary')}
                                {processingSummary ? 'Regenerating...' : 'Regenerate'}
                            {:else}
                                {processingSummary ? 'Generating...' : 'Generate Overview'}
                            {/if}
                        </button>
                    </div>
                    <div class="p-4 text-gray-700">
                        {#if processingSummary}
                            <div class="flex items-center gap-2 text-blue-600">
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {getContent('summary') ? 'Regenerating overview...' : 'Generating overview...'}
                            </div>
                        {:else if getContent('summary')?.content === 'FAILED'}
                            <div class="text-red-600 mb-4">Failed to generate overview.</div>
                            <button 
                                class="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-2"
                                on:click={() => processDocument('summary')}
                                disabled={processingSummary}
                            >
                                {#if processingSummary}
                                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                {/if}
                                {processingSummary ? 'Trying Again...' : 'Try Again'}
                            </button>
                        {:else if getContent('summary')?.content}
                            {getContent('summary')?.content}
                        {:else}
                            <p class="text-gray-500 text-center py-4">Click "Generate Overview" to create a summary of this document.</p>
                        {/if}
                    </div>
                </div>

                <!-- Quiz section with generate button -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="p-4">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h2 class="text-lg font-medium text-gray-800">Quizzes</h2>
                                <p class="text-sm text-gray-500 mt-1">Test your knowledge of the document</p>
                            </div>
                            <button 
                                class="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium"
                                on:click={handleQuizGeneration}
                                disabled={processingQuiz}
                            >
                                {#if processingQuiz}
                                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                {/if}
                                {processingQuiz ? 'Generating...' : 'New Quiz'}
                            </button>
                        </div>

                        {#if data.quizzes.length > 0}
                            <div class="space-y-3">
                                {#each data.quizzes as quiz}
                                    <a 
                                        href={`/quiz/${quiz.id}`}
                                        class="block p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-blue-200 hover:shadow-sm"
                                    >
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h3 class="text-gray-900 font-medium">{quiz.title}</h3>
                                                <p class="text-sm text-gray-500 mt-1">
                                                    Created {new Date(quiz.createdAt!).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span class="text-blue-600 text-sm font-medium">Take Quiz →</span>
                                        </div>
                                    </a>
                                {/each}
                            </div>
                        {:else}
                            <div class="text-center py-8 px-4">
                                <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                    <span class="text-2xl">📝</span>
                                </div>
                                <p class="text-gray-500">No quizzes generated yet.</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>