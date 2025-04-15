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
            : segment === 'document'
                ? 'Documents'
                : segment.charAt(0).toUpperCase() + segment.slice(1);
        return { url, label };
    });
</script>

<div class="py-6">
    <div class="mx-auto max-w-4xl px-8">
        <nav class="flex text-sm items-center">
            <a 
                href="/" 
                class="text-gray-600 hover:text-purple-700 transition-colors duration-150 flex items-center gap-1"
            >
                <span class="text-lg">🏠</span>
            </a>
            {#each breadcrumbs as { url, label }, i}
                <div class="flex items-center">
                    <span class="mx-3 text-gray-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                    <a 
                        href={url} 
                        class="text-gray-600 hover:text-purple-700 transition-colors duration-150
                            {label.length > 30 ? 'truncate max-w-[200px]' : ''} 
                            {i === breadcrumbs.length - 1 ? 'font-medium text-purple-700' : ''}"
                        title={label}
                    >
                        {label}
                    </a>
                </div>
            {/each}
        </nav>
    </div>
</div> 