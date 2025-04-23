<script lang="ts">
    import { modalDialog } from '$lib/stores/modal';
    import { fade } from 'svelte/transition';

    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700'
    };
</script>

{#if $modalDialog.isOpen && $modalDialog.options}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        transition:fade
    >
        <div 
            class="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            transition:fade
        >
            <h2 class="text-xl font-semibold text-gray-900 mb-2">
                {$modalDialog.options.title}
            </h2>
            <p class="text-gray-600 mb-6">
                {$modalDialog.options.message}
            </p>
            <div class="flex justify-end gap-3">
                <button
                    class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    on:click={() => modalDialog.close(false)}
                >
                    {$modalDialog.options.cancelText}
                </button>
                <button
                    class="px-4 py-2 rounded-lg text-white transition-colors {colorClasses[$modalDialog.options.confirmColor || 'blue']}"
                    on:click={() => modalDialog.close(true)}
                >
                    {$modalDialog.options.confirmText}
                </button>
            </div>
        </div>
    </div>
{/if} 