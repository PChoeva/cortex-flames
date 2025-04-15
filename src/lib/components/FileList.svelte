<script lang="ts">
	import type { Document } from '$lib/types';
	import { formatFileSize } from '$lib/utils/index';
	
	export let documents: Document[] = [];

	// Group documents by baseFilename
	$: groupedDocuments = documents.reduce((acc, doc) => {
		if (!acc[doc.baseFilename]) {
			acc[doc.baseFilename] = [];
		}
		acc[doc.baseFilename].push(doc);
		return acc;
	}, {} as Record<string, Document[]>);

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="grid gap-4">
	{#if documents.length === 0}
		<p class="text-gray-500 text-center py-8">No documents uploaded yet</p>
	{:else}
		{#each Object.entries(groupedDocuments) as [baseFilename, versions]}
			<div class="border p-4 rounded hover:bg-gray-50">
				<div class="flex justify-between items-start">
					<div>
						<h3 class="font-bold">{baseFilename}</h3>
						<p class="text-sm text-gray-600">
							{versions.length} version{versions.length > 1 ? 's' : ''}
						</p>
						{#each versions as version}
							<div class="mt-2 text-sm">
								<span class="text-gray-500">v{version.versionNumber}</span> • 
								{formatFileSize(version.size)} • 
								Uploaded {formatDate(version.uploadedAt)}
								<div class="inline-flex gap-2 ml-2">
									<a 
										href="/document/{version.id}" 
										class="text-blue-500 hover:text-blue-700"
									>
										View
									</a>
									<a 
										href={version.url} 
										download={version.filename}
										class="text-blue-500 hover:text-blue-700"
									>
										Download
									</a>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
