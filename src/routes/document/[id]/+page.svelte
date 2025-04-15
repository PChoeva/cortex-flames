<script lang="ts">
    import type { PageData } from './$types';
    import FilePreview from '$lib/components/FilePreview.svelte';
    
    export let data: PageData;
</script>

<div class="mx-auto max-w-xl p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
    <h1 class="mb-6 text-2xl font-bold text-gray-800">{data.document.originalName}</h1>
    <FilePreview 
        url={data.document.url}
        mimeType={data.document.mimeType}
        filename={data.document.originalName}
    />
</div> 