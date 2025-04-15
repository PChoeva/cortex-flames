<script lang="ts">
    export let url: string;
    export let mimeType: string;
    export let filename: string;

    let textContent: string | null = null;
    let loading = false;
    let error: string | null = null;

    const isTextFile = (mime: string) => {
        return mime === 'text/plain' || mime === 'text/markdown';
    };

    const isPreviewable = (mime: string) => {
        return (
            mime.startsWith('image/') ||
            mime === 'application/pdf' ||
            isTextFile(mime) ||
            mime.includes('document')
        );
    };

    async function fetchTextContent() {
        loading = true;
        error = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch file content');
            textContent = await response.text();
        } catch (e) {
            error = 'Failed to load text content';
            console.error(e);
        } finally {
            loading = false;
        }
    }

    $: if (isTextFile(mimeType)) {
        fetchTextContent();
    }
</script>

<div class="border rounded p-4">
    {#if mimeType.startsWith('image/')}
        <img src={url} alt={filename} class="max-w-full" />
    {:else if mimeType === 'application/pdf'}
        <iframe src={url} title={filename} class="w-full h-[600px]" />
    {:else if isTextFile(mimeType)}
        {#if loading}
            <div class="text-center p-4">
                <p>Loading text content...</p>
            </div>
        {:else if error}
            <div class="text-center p-4 text-red-500">
                <p>{error}</p>
            </div>
        {:else if textContent !== null}
            <pre class="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 rounded max-h-[600px] overflow-y-auto">
                {textContent}
            </pre>
        {/if}
    {:else if isPreviewable(mimeType)}
        <iframe src={url} title={filename} class="w-full h-[600px]" />
    {:else}
        <div class="text-center p-4 space-y-4">
            <div class="text-6xl mb-4">📄</div>
            <p class="text-gray-600">Preview not available for {mimeType}</p>
            <p class="text-sm text-gray-500">File: {filename}</p>
            <a 
                href={url}
                download={filename}
                class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Download File
            </a>
        </div>
    {/if}
</div> 