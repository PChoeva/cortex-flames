<script lang="ts">
    import type { PageData } from './$types';
    import FilePreview from '$lib/components/FilePreview.svelte';
    
    export let data: PageData;
</script>

<div class="mx-auto max-w-xl">
    <div class="p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
        <!-- Decorative corner accent -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-bl-[100px]" />
        
        <h1 class="text-2xl font-bold">{data.document.filename}</h1>

        <FilePreview 
            url={data.document.url}
            mimeType={data.document.mimeType}
            filename={data.document.originalName}
        />
    </div>
</div> 