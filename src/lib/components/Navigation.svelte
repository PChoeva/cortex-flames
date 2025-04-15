<script lang="ts">
    import { page } from '$app/stores';
    
    $: currentPath = $page.url.pathname;
    
    const links = [
        { href: '/', label: 'Upload New', icon: '📄' },
        { href: '/document', label: 'Documents', icon: '📚' }
    ];
</script>

<nav class="bg-gradient-to-r from-orange-600 via-red-600 to-purple-700 text-white shadow-lg">
    <div class="mx-auto max-w-xl px-4 py-4">
        <div class="flex items-center justify-between">
            <div class="text-xl font-bold flex items-center gap-2">
                <span class="text-2xl">🔥</span>
                <span class="text-white">Cortex Flames</span>
            </div>
            <div class="flex gap-4">
                {#each links as { href, label, icon }}
                    <a 
                        {href}
                        class="flex items-center gap-2 px-4 py-2 rounded-md transition-all bg-black/10
                            {currentPath === href 
                                ? 'bg-white text-purple-700 font-medium shadow-lg' 
                                : 'text-white hover:bg-white hover:text-purple-700'}"
                    >
                        <span class="text-lg">{icon}</span>
                        <span>{label}</span>
                    </a>
                {/each}
            </div>
        </div>
    </div>
</nav>

<style>
    /* Optional: Add a subtle animation on hover */
    a {
        transform: translateY(0);
        transition: transform 0.15s ease-in-out;
    }
    
    a:hover {
        transform: translateY(-1px);
    }
</style> 