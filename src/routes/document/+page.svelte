<script lang="ts">
    import type { PageData } from './$types';
    import type { Document } from '$lib/types';
    import FileList from '$lib/components/FileList.svelte';
    
    export let data: PageData;
    $: documents = (data.documents ?? []) as unknown as Document[];
</script>

<div class="mx-auto max-w-xl p-6">
    <h1 class="mb-6 text-2xl font-bold">Documents</h1>
    {#if documents.length === 0}
        <p class="text-gray-500 text-center py-8">No documents uploaded yet. <a href="/" class="text-blue-500 hover:text-blue-700">Upload one?</a></p>
    {:else}
        <FileList {documents} />
    {/if}
</div>
