<script lang="ts">
    import { scale } from 'svelte/transition';
    
    export let show = false;
    export let filename = '';
    export let onConfirm: () => void;
    export let onCancel: () => void;
</script>

{#if show}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
            class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                Delete Document
            </h2>
            <p class="text-gray-600 mb-8">
                Are you sure you want to delete "{filename}"? This action cannot be undone.
            </p>
            <div class="flex gap-4 justify-end">
                <button
                    class="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    on:click={onCancel}
                >
                    Cancel
                </button>
                <button
                    class="px-6 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                    on:click={onConfirm}
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if} 