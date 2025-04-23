<script lang="ts">
	import '../app.css';
	import '$lib/components/styles/shared.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50">
	<Navigation />
	<Breadcrumbs />
	<main class="py-6 relative">
		<!-- Animated background elements -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="absolute -top-4 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl animate-pulse" 
				 style="--tw-animate-duration: 3s;" />
			<div class="absolute top-32 -left-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" 
				 style="--tw-animate-duration: 4s;" />
			<div class="absolute bottom-0 right-0 w-80 h-80 bg-red-200/30 rounded-full blur-3xl animate-pulse" 
				 style="--tw-animate-duration: 5s;" />
			
			<!-- Optimized grid pattern -->
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[size:30px_30px]"
				 style="mask-image: linear-gradient(to bottom, transparent, black);" />
		</div>
		<!-- Content -->
		<div class="relative mx-auto max-w-4xl px-8">
			<slot />
		</div>
	</main>
	<ConfirmModal />
</div>

<style>
	:global(body) {
		overflow-x: hidden;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
	}

	/* Optimize animations */
	:global(*) {
		@apply motion-reduce:transform-none motion-reduce:transition-none;
	}
</style>
