<script lang="ts">
	import type { Document } from '$lib/types';
	import { formatFileSize, formatDate } from '$lib/utils';
	import { modalDialog } from '$lib/stores/modal';
	
	export let documents: Document[];

	async function deleteDocument(document: Document) {
		try {
			const response = await fetch(`/api/document/${document.id}/delete`, {
				method: 'POST'
			});
			
			if (!response.ok) throw new Error('Failed to delete');
			
			// Update local state to show deletion
			documents = documents.map(doc => 
				doc.id === document.id ? { ...doc, deleted: true } : doc
			);
		} catch (e) {
			console.error('Delete failed:', e);
			alert('Failed to delete document');
		}
	}

	async function handleDeleteClick(document: Document) {
		const confirmed = await modalDialog.show({
			title: 'Delete Document',
			message: `Are you sure you want to delete "${document.filename}"? This action cannot be undone.`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
			confirmColor: 'red'
		});

		if (confirmed) {
			await deleteDocument(document);
		}
	}
</script>

<div class="space-y-4">
	{#each documents as document}
		<div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
			<div class="flex justify-between items-center gap-4">
				<div class="flex-1 min-w-0">
					<h3 class="text-xl font-semibold bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text relative truncate">
						{document.filename}
						{#if document.deleted}
							<div class="absolute inset-y-1/2 w-full h-0.5 bg-gray-300"></div>
						{/if}
					</h3>
					<p class="text-sm text-gray-600 mt-1">
						{formatFileSize(document.size)} • {formatDate(document.uploadedAt)}
					</p>
				</div>

				{#if !document.deleted}
					<div class="flex gap-2 items-center">
						<a 
							href="/document/{document.id}" 
							class="px-4 py-2 rounded-xl bg-white text-purple-700 font-medium hover:bg-purple-50 transition-colors shadow-sm"
						>
							View
						</a>
						<a 
							href="/quiz" 
							class="px-4 py-2 rounded-xl bg-white text-purple-700 font-medium hover:bg-purple-50 transition-colors shadow-sm"
						>
							Quizzes
						</a>
						<a 
							href={document.url} 
							download={document.filename}
							class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium hover:from-orange-600 hover:to-purple-700 transition-all shadow-sm"
						>
							Download
						</a>
						<button 
							on:click={() => handleDeleteClick(document)}
							class="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors shadow-sm"
						>
							Delete
						</button>
					</div>
				{:else}
					<span class="text-sm text-gray-500 italic">Deleted</span>
				{/if}
			</div>
		</div>
	{/each}
</div>
