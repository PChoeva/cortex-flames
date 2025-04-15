<script lang="ts">
    import { page } from '$app/stores';
    
    $: path = $page.url.pathname;
    $: segments = path.split('/').filter(Boolean);
    $: isDocumentDetail = segments[0] === 'document' && segments.length === 2;
    
    // Get the document name from the page data if we're on a document detail page
    $: documentName = isDocumentDetail && $page.data.document?.originalName;
    
    $: breadcrumbs = segments.map((segment, index) => {
        const url = '/' + segments.slice(0, index + 1).join('/');
        // If this is the last segment and we're on a document detail page, use the document name
        const label = (isDocumentDetail && index === segments.length - 1)
            ? documentName || 'Loading...'
            : segment.charAt(0).toUpperCase() + segment.slice(1);
        return { url, label };
    });
</script>

<div class="bg-gray-50 py-2">
    <div class="mx-auto max-w-xl px-4">
        <nav class="flex text-sm items-center">
            <a href="/" class="text-gray-600 hover:text-blue-600">Home</a>
            {#each breadcrumbs as { url, label }}
                <span class="mx-2 text-gray-400">/</span>
                <a href={url} class="text-gray-600 hover:text-blue-600 {label.length > 30 ? 'truncate max-w-[200px]' : ''}" title={label}>
                    {label}
                </a>
            {/each}
        </nav>
    </div>
</div> 