<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50">
	<Navigation />
	<Breadcrumbs />
	<main class="py-6 relative">
		<!-- Decorative background elements -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="absolute -top-4 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30" />
			<div class="absolute top-32 -left-32 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />
			<div class="absolute bottom-0 right-0 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-30" />
		</div>
		<!-- Content -->
		<div class="relative">
			<slot />
		</div>
	</main>
</div>
