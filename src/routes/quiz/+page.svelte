<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<div class="p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
    <!-- Decorative corner accent -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-bl-[100px]" />
    
    <h1 class="mb-8 text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
        Quizzes
    </h1>

    {#if data.quizzes.length === 0}
        <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="text-3xl">📝</span>
            </div>
            <p class="text-gray-500 mb-4">No quizzes available yet.</p>
            <a 
                href="/document" 
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium hover:from-orange-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
                <span>Go to Documents</span>
                <span>→</span>
            </a>
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each data.quizzes as quiz}
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div class="flex flex-col gap-2">
                        <h3 class="text-xl font-semibold bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
                            {quiz.title}
                        </h3>
                        <p class="text-sm text-gray-600">
                            From: <a href="/document/{quiz.documentId}" class="text-blue-600 hover:underline">{quiz.documentName}</a>
                        </p>
                        <p class="text-sm text-gray-500">
                            Created {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                        <div class="mt-4">
                            <a 
                                href="/quiz/{quiz.id}" 
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors"
                            >
                                Take Quiz →
                            </a>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div> 