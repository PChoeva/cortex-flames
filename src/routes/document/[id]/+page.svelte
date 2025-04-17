<script lang="ts">
    import type { PageData } from './$types';
    import type { ContentType } from '$lib/constants';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;
    let { document, contents } = data;

    let processing = false;
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

    async function processDocument(type: ContentType) {
        try {
            processing = true;
            error = null;

            const response = await fetch(`/api/document/${document.id}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to process document');
            }

            // Poll for completion
            while (processing) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between checks
                const isComplete = await checkProcessingStatus(document.id);
                if (isComplete) {
                    break;
                }
            }

            // Refresh the data once processing is complete
            await invalidateAll();
            
        } catch (e) {
            console.error('Processing error:', e);
            error = e instanceof Error ? e.message : 'Failed to process document';
        } finally {
            processing = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-semibold text-gray-800">{document.filename}</h1>
                
                <!-- Status Badge with Spinner -->
                {#if document.processingStatus}
                    <div class="flex items-center gap-2">
                        {#if document.processingStatus === 'processing'}
                            <svg class="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        {/if}
                        <span class={`px-3 py-1 rounded-full text-sm font-medium
                            ${document.processingStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                            document.processingStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                            {document.processingStatus}
                        </span>
                    </div>
                {/if}
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
                            disabled={processing || document.processingStatus === 'processing'}>
                            {#if processing && !getContent('raw_text')}
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
                
                <div class="flex items-center gap-3">
                    {#if document.mimeType !== 'text/plain'}
                        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-semibold">2</span>
                    {/if}
                    <button
                        class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                               disabled:opacity-50 transition-colors duration-200 flex items-center gap-2
                               {document.mimeType !== 'text/plain' ? 'flex-1' : 'w-auto'}"
                        on:click={() => processDocument('summary')}
                        disabled={processing || document.processingStatus === 'processing' || 
                                 (document.mimeType !== 'text/plain' && !getContent('raw_text'))}>
                        {#if processing && (document.mimeType !== 'text/plain' || !getContent('raw_text'))}
                            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        {:else}
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        {/if}
                        Generate Overview
                    </button>
                    {#if !getContent('raw_text') && document.mimeType !== 'text/plain'}
                        <div class="text-sm text-gray-500 italic">
                            Extract text first
                        </div>
                    {/if}
                </div>
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

                <!-- Overview section with retry button -->
                {#if getContent('summary')}
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div class="border-b border-gray-100 p-4 flex justify-between items-center">
                            <h2 class="text-lg font-medium text-gray-800">Overview</h2>
                            <button 
                                class="text-sm px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-2"
                                on:click={() => processDocument('summary')}
                                disabled={processing}
                            >
                                {#if processing}
                                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                {/if}
                                {processing ? 'Regenerating...' : 'Regenerate'}
                            </button>
                        </div>
                        <div class="p-4 text-gray-700">
                            {#if getContent('summary')?.content === 'FAILED'}
                                <div class="text-red-600 mb-4">Failed to generate overview.</div>
                                <button 
                                    class="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-2"
                                    on:click={() => processDocument('summary')}
                                    disabled={processing}
                                >
                                    {#if processing}
                                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    {/if}
                                    {processing ? 'Trying Again...' : 'Try Again'}
                                </button>
                            {:else}
                                {getContent('summary')?.content}
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>