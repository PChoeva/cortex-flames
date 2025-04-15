<script lang="ts">
	let files: FileList | null = null;
	let uploading = false;
	let error: string | null = null;

	async function handleSubmit() {
		if (!files || files.length === 0) {
			error = 'Please select a file';
			return;
		}

		uploading = true;
		error = null;

		const formData = new FormData();
		formData.append('document', files[0]);

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) throw new Error('Upload failed');
			const result = await response.json();
			files = null;
			window.location.href = `/document/${result.document.id}`;
		} catch (e) {
			error = 'Failed to upload document';
			console.error(e);
		} finally {
			uploading = false;
		}
	}
</script>

<div class="mx-auto max-w-xl p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
	<h1 class="mb-6 text-2xl font-bold text-gray-800">Upload Document</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div class="rounded-lg border-2 border-dashed border-purple-300 p-6 bg-white/50 transition-colors hover:border-orange-400">
			<input 
				type="file" 
				bind:files 
				accept="image/*,.pdf,.doc,.docx,.txt,.rtf" 
				class="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" 
				disabled={uploading} 
			/>
		</div>

		{#if error}
			<p class="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>
		{/if}

		<button
			type="submit"
			class="w-full rounded bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-2 text-white hover:from-orange-600 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
			disabled={uploading}
		>
			{uploading ? 'Uploading...' : 'Upload Document'}
		</button>
	</form>
</div>
