<script lang="ts">
	let files: FileList | null = null;
	let uploading = false;
	let error: string | null = null;
	let dragOver = false;
	let fileInput: HTMLInputElement;

	$: selectedFileName = files?.[0]?.name;

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

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (e.dataTransfer?.files) {
			files = e.dataTransfer.files;
		}
	}

	function clearFile(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		files = null;
		error = null;
	}

	function triggerFileInput(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		fileInput.click();
	}
</script>

<div class="p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
	<div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-bl-[100px]" />
	
	<h1 class="mb-8 text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
		Upload Document
	</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Upload area -->
		<div
			class="mt-4 rounded-2xl border-3 border-dashed transition-all duration-300 relative group
				{dragOver 
					? 'border-purple-400 bg-purple-50/50' 
					: 'border-purple-200 hover:border-orange-400 bg-white/50'}"
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
		>
			<input 
				type="file" 
				bind:files 
				bind:this={fileInput}
				accept="image/*,.pdf,.doc,.docx,.txt,.rtf" 
				class="hidden"
				disabled={uploading}
			/>
			
			<div 
				class="w-full p-6 text-center relative z-10 cursor-pointer"
				on:click={triggerFileInput}
			>
				<div class="flex flex-col items-center justify-center">
					<div class="w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
						<span class="text-3xl">{selectedFileName ? '📄' : '📎'}</span>
					</div>
					{#if selectedFileName}
						<p class="text-lg font-medium text-gray-700">{selectedFileName}</p>
						<div class="flex gap-2 mt-2 items-center">
							<button 
								type="button"
								class="text-sm text-red-500 hover:text-red-600"
								on:click={clearFile}
							>
								Remove
							</button>
							<span class="text-gray-400">|</span>
							<button 
								type="button"
								class="text-sm text-gray-500 hover:text-gray-600"
								on:click={triggerFileInput}
							>
								Click to change file
							</button>
						</div>
					{:else}
						<p class="text-lg font-medium text-gray-700">Drop files here or click to upload</p>
						<p class="text-sm text-gray-500 mt-2">Supports images, PDFs, DOC, and TXT files</p>
					{/if}
				</div>
			</div>
		</div>

		{#if error}
			<div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
				<p class="text-sm text-red-700">{error}</p>
			</div>
		{/if}

		<button
			type="submit"
			class="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium 
				hover:from-orange-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 
				disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
			disabled={!files || uploading}
		>
			{#if uploading}
				Uploading...
			{:else}
				Upload Document
			{/if}
		</button>
	</form>
</div>
