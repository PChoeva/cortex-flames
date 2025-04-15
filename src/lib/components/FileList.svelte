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

<div class="grid gap-6">
	{#each Object.entries(groupedDocuments) as [baseFilename, versions]}
		<div class="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300 group">
			<div class="flex justify-between items-start">
				<div class="flex-1">
					<h3 class="text-xl font-semibold bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
						{baseFilename}
					</h3>
					<p class="text-sm text-gray-600 mt-1">
						{versions.length} version{versions.length > 1 ? 's' : ''}
					</p>
					
					<div class="mt-4 space-y-3">
						{#each versions as version}
							<div class="bg-white/50 rounded-xl p-4 transition-transform group-hover:scale-[1.02]">
								<div class="flex items-center justify-between">
									<div>
										<span class="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
											v{version.versionNumber}
										</span>
										<div class="mt-2 text-sm text-gray-600">
											{formatFileSize(version.size)} • Uploaded {formatDate(version.uploadedAt)}
										</div>
									</div>
									<div class="flex gap-2">
										<a 
											href="/document/{version.id}" 
											class="px-4 py-2 rounded-xl bg-white text-purple-700 font-medium hover:bg-purple-50 transition-colors shadow-sm"
										>
											View
										</a>
										<a 
											href={version.url} 
											download={version.filename}
											class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium hover:from-orange-600 hover:to-purple-700 transition-all shadow-sm"
										>
											Download
										</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
