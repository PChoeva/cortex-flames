<script lang="ts">
    import { page } from '$app/stores';
    import { slide } from 'svelte/transition';
    
    $: currentPath = $page.url.pathname;
    
    const links = [
        { href: '/', label: 'Upload New', icon: '📄' },
        { href: '/document', label: 'Documents', icon: '📚' },
        { href: '/quiz', label: 'Quizzes', icon: '🧠' }
    ];

    let isMenuOpen = false;
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
            
            <!-- Desktop navigation -->
            <div class="hidden md:flex md:items-center md:space-x-4">
                {#each links as link}
                    <a
                        href={link.href}
                        class="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors {currentPath === link.href ? 'bg-white/20' : ''}"
                    >
                        <span class="mr-2">{link.icon}</span>
                        {link.label}
                    </a>
                {/each}
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
        </div>

        <!-- Mobile menu -->
        {#if isMenuOpen}
            <div class="md:hidden" transition:slide>
                <div class="px-2 pt-2 pb-3 space-y-1">
                    {#each links as link}
                        <a
                            href={link.href}
                            class="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors {currentPath === link.href ? 'bg-white/20' : ''}"
                        >
                            <span class="mr-2">{link.icon}</span>
                            {link.label}
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</nav>

<style>
    a {
        transition: all 0.08s ease-out;
    }
</style> 