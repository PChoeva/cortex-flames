<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="mx-auto max-w-xl p-6">
    <h1 class="mb-6 text-2xl font-bold text-red-500">Error {$page.status}</h1>
    <p class="text-gray-600">{$page.error?.message}</p>
    <a href="/" class="mt-4 inline-block text-blue-500 hover:text-blue-700">Return home</a>
</div> 