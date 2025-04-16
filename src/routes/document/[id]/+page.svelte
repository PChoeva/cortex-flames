<script lang="ts">
    import type { PageData } from './$types';
    import type { ContentType } from '$lib/constants';

    export let data: PageData;
    const { document, contents } = data;

    let processing = false;
    let error: string | null = null;
    let isTextExpanded = false;

    function getContent(type: ContentType) {
        return contents.find(c => c.type === type);
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
                throw new Error('Failed to start processing');
            }

            window.location.reload();
        } catch (e) {
            console.error('Processing error:', e);
            error = 'Failed to process document';
        } finally {
            processing = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-semibold text-gray-800">{document.filename}</h1>
                
                <!-- Status Badge -->
                {#if document.processingStatus}
                    <span class={`px-3 py-1 rounded-full text-sm font-medium
                        ${document.processingStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                        document.processingStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                        {document.processingStatus}
                    </span>
                {/if}
            </div>

            <!-- Error Message -->
            {#if error}
                <div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error}</div>
            {/if}

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                           disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                    on:click={() => processDocument('raw_text')}
                    disabled={processing || document.processingStatus === 'processing'}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Extract Text
                </button>
                
                <button
                    class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                           disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                    on:click={() => processDocument('summary')}
                    disabled={processing || document.processingStatus === 'processing'}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    Generate Summary
                </button>
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

                <!-- Summary -->
                {#if getContent('summary')}
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div class="border-b border-gray-100 p-4">
                            <h2 class="text-lg font-medium text-gray-800">Summary</h2>
                        </div>
                        <div class="p-4 text-gray-700">
                            {getContent('summary')?.content}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>