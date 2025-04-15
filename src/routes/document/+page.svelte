<script lang="ts">
    import type { PageData } from './$types';
    import type { Document } from '$lib/types';
    import FileList from '$lib/components/FileList.svelte';
    
    export let data: PageData;
    $: documents = (data.documents ?? []) as unknown as Document[];
</script>

<div class="p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
    <!-- Decorative corner accent -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-bl-[100px]" />
    
    <h1 class="mb-8 text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
        Documents
    </h1>

    {#if documents.length === 0}
        <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="text-3xl">��</span>
            </div>
            <p class="text-gray-500 mb-4">No documents uploaded yet.</p>
            <a 
                href="/" 
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium hover:from-orange-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
                <span>Upload your first document</span>
                <span>→</span>
            </a>
        </div>
    {:else}
        <FileList {documents} />
    {/if}
</div>
