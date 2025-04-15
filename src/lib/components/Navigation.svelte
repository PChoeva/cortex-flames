<script lang="ts">
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    
    $: currentPath = $page.url.pathname;
    
    const links = [
        { href: '/', label: 'Upload New', icon: '📄' },
        { href: '/document', label: 'Documents', icon: '📚' }
    ];

    let isScrolled = false;
    
    onMount(() => {
        if (browser) {
            const handleScroll = () => {
                isScrolled = window.scrollY > 0;
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    });
</script>

<nav class="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-red-600 to-purple-700">
    <div class="mx-auto max-w-4xl px-8">
        <div class="flex h-16 items-center">
            <div class="flex-shrink-0">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🔥</span>
                    <span class="text-white text-xl font-bold">Cortex Flames</span>
                </div>
            </div>
            <div class="ml-16 flex gap-2">
                {#each links as { href, label, icon }}
                    <a 
                        {href}
                        class="flex items-center gap-2 px-4 py-2 rounded-xl
                            {currentPath === href 
                                ? 'bg-white text-purple-700 font-medium' 
                                : 'text-white hover:bg-white/10'}"
                    >
                        <span class="text-lg">{icon}</span>
                        <span class="font-medium whitespace-nowrap">{label}</span>
                    </a>
                {/each}
            </div>
        </div>
    </div>
</nav>

<style>
    a {
        transition: all 0.08s ease-out;
    }
</style> 