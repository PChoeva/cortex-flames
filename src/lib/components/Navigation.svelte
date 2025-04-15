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
    let isMenuOpen = false;
    
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
        <div class="flex h-16 items-center justify-between">
            <div class="flex-shrink-0">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🔥</span>
                    <span class="text-white text-xl font-bold">Cortex Flames</span>
                </div>
            </div>
            
            <!-- Mobile menu button -->
            <button 
                class="md:hidden rounded-lg p-2 text-white hover:bg-white/10"
                on:click={() => isMenuOpen = !isMenuOpen}
                aria-label="Toggle menu"
            >
                {#if isMenuOpen}
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                {:else}
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                {/if}
            </button>

            <!-- Desktop navigation -->
            <div class="hidden md:ml-16 md:flex md:gap-2">
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

        <!-- Mobile navigation -->
        {#if isMenuOpen}
            <div class="md:hidden py-2 space-y-1" transition:slide>
                {#each links as { href, label, icon }}
                    <a 
                        {href}
                        class="flex items-center gap-2 px-4 py-3 rounded-xl w-full
                            {currentPath === href 
                                ? 'bg-white text-purple-700 font-medium' 
                                : 'text-white hover:bg-white/10'}"
                        on:click={() => isMenuOpen = false}
                    >
                        <span class="text-lg">{icon}</span>
                        <span class="font-medium">{label}</span>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</nav>

<style>
    a {
        transition: all 0.08s ease-out;
    }
</style> 