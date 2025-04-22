<script lang="ts">
    import type { PageData } from './$types';
    import { QuestionType } from '$lib/types/quiz';
    
    export let data: PageData;

    let currentQuestionIndex = 0;
    let selectedAnswers: Record<number, number[]> = {};
    let showExplanation = false;
    let quizCompleted = false;

    $: currentQuestion = data.questions[currentQuestionIndex];
    $: isLastQuestion = currentQuestionIndex === data.questions.length - 1;
    $: isFirstQuestion = currentQuestionIndex === 0;
    $: hasAnsweredAllQuestions = data.questions.every(q => selectedAnswers[q.id]?.length > 0);

    function handleOptionSelect(optionIndex: number) {
        if (quizCompleted) return;
        
        if (currentQuestion.type === QuestionType.MULTIPLE_ANSWERS) {
            const currentAnswers = selectedAnswers[currentQuestion.id] || [];
            const newAnswers = currentAnswers.includes(optionIndex)
                ? currentAnswers.filter(i => i !== optionIndex)
                : [...currentAnswers, optionIndex];
                
            selectedAnswers = {
                ...selectedAnswers,
                [currentQuestion.id]: newAnswers
            };
        } else {
            // Handle both SINGLE_ANSWER and TRUE_FALSE
            selectedAnswers = {
                ...selectedAnswers,
                [currentQuestion.id]: [optionIndex]
            };
        }
    }

    function isOptionSelected(optionIndex: number): boolean {
        const answers = selectedAnswers[currentQuestion.id] || [];
        return answers.includes(optionIndex);
    }

    function previousQuestion() {
        showExplanation = false;
        currentQuestionIndex--;
    }

    function nextQuestion() {
        if (!selectedAnswers[currentQuestion.id]?.length) {
            return; // Don't allow proceeding without an answer
        }
        
        showExplanation = false;
        if (isLastQuestion) {
            if (hasAnsweredAllQuestions) {
                quizCompleted = true;
            }
        } else {
            currentQuestionIndex++;
        }
    }

    function calculateScore(): { correct: number; total: number } {
        let correct = 0;
        const total = data.questions.length;

        data.questions.forEach(q => {
            const selected = selectedAnswers[q.id] || [];
            const correctAnswers = q.options
                .map((opt, idx) => opt.isCorrect ? idx : -1)
                .filter(idx => idx !== -1);

            if (selected.length === correctAnswers.length &&
                selected.every(s => correctAnswers.includes(s))) {
                correct++;
            }
        });

        return { correct, total };
    }
</script>

<div class="max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
        {data.quiz.title}
    </h1>
    
    {#if !quizCompleted}
        <div class="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm p-8 border border-white/50 relative">
            <!-- Decorative corner accent -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-bl-[100px]" />
            
            <h2 class="text-xl font-semibold mb-2">Question {currentQuestionIndex + 1} of {data.questions.length}</h2>
            <p class="text-sm text-purple-600 mb-4">
                {currentQuestion.type === 'multiple_answers' ? 'Select all that apply' : 'Select one answer'}
            </p>
            <p class="text-lg mb-6">{currentQuestion.question}</p>
            
            <div class="space-y-3">
                {#each currentQuestion.options as option, index}
                    <button
                        type="button"
                        class="w-full text-left p-4 rounded-xl border transition-colors flex items-center gap-3"
                        class:bg-gray-50={isOptionSelected(index)}
                        class:border-purple-500={isOptionSelected(index)}
                        class:shadow-sm={isOptionSelected(index)}
                        class:border-gray-200={!isOptionSelected(index)}
                        class:hover:border-purple-200={!isOptionSelected(index)}
                        class:hover:bg-purple-50={!isOptionSelected(index)}
                        on:click={() => handleOptionSelect(index)}
                    >
                        <div 
                            class="w-6 h-6 border-2 flex items-center justify-center shrink-0"
                            class:rounded={currentQuestion.type === 'multiple_answers'}
                            class:rounded-full={currentQuestion.type !== 'multiple_answers'}
                            class:bg-purple-500={isOptionSelected(index)}
                            class:border-purple-500={isOptionSelected(index)}
                            class:border-gray-300={!isOptionSelected(index)}
                        >
                            {#if isOptionSelected(index)}
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            {/if}
                        </div>
                        <span class="flex-1 {isOptionSelected(index) ? 'text-purple-900 font-medium' : 'text-gray-700'}">
                            {option.text}
                        </span>
                    </button>
                {/each}
            </div>

            {#if showExplanation}
                <div class="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 class="font-semibold mb-2 text-purple-900">Explanation:</h3>
                    <p class="text-purple-700">{currentQuestion.explanation}</p>
                </div>
            {/if}

            <div class="mt-6 flex justify-between">
                <div class="flex gap-2">
                    {#if !isFirstQuestion}
                        <button
                            class="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 font-medium"
                            on:click={previousQuestion}
                        >
                            ← Previous
                        </button>
                    {/if}
                    <button
                        class="px-4 py-2 text-purple-500 hover:text-purple-700 transition-colors text-sm underline underline-offset-2"
                        on:click={() => showExplanation = !showExplanation}
                    >
                        {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                    </button>
                </div>
                <button
                    class="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-purple-600"
                    on:click={nextQuestion}
                    disabled={!selectedAnswers[currentQuestion.id]?.length}
                >
                    {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    {:else}
        <div class="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm p-8 border border-white/50">
            <h2 class="text-2xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
                Quiz Results
            </h2>
            
            {#if Object.keys(selectedAnswers).length > 0}
                {@const score = calculateScore()}
                <div class="text-center mb-8">
                    <div class="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-purple-700 text-transparent bg-clip-text">
                        {score.correct} / {score.total}
                    </div>
                    <p class="text-gray-600 text-lg">
                        You got {score.correct} out of {score.total} questions correct!
                    </p>
                </div>

                <div class="mt-6 space-y-6">
                    {#each data.questions as question, i}
                        {@const selected = selectedAnswers[question.id] || []}
                        <div class="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100">
                            <h3 class="font-medium mb-2">Question {i + 1}: {question.question}</h3>
                            <div class="space-y-2 ml-4">
                                {#each question.options as option, j}
                                    <div class="flex items-center gap-2">
                                        <div class="w-5 h-5 flex-shrink-0">
                                            {#if selected.includes(j) && option.isCorrect}
                                                <svg class="text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            {:else if selected.includes(j) && !option.isCorrect}
                                                <svg class="text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                            {:else if !selected.includes(j) && option.isCorrect}
                                                <svg class="text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            {/if}
                                        </div>
                                        <span class="{
                                            selected.includes(j) ? 'font-semibold text-purple-900' : 
                                            !selected.includes(j) && option.isCorrect ? 'text-green-700' : 
                                            'text-gray-600'
                                        }">
                                            {option.text}
                                        </span>
                                    </div>
                                {/each}
                            </div>
                            <p class="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">{question.explanation}</p>
                        </div>
                    {/each}
                </div>
            {/if}

            <div class="mt-8">
                <a 
                    href="/quiz"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl hover:from-orange-600 hover:to-purple-700 transition-all duration-300"
                >
                    Back to Quizzes
                </a>
            </div>
        </div>
    {/if}
</div> 