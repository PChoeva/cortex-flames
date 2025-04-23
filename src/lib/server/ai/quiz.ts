import { db } from '$lib/server/db';
import { document, documentContent, quiz, question, option } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { openai } from './openai';
import type { QuizQuestion } from '$lib/types/quiz';
import { QuestionType } from '$lib/types/quiz';
import { quizLogger as logger } from '$lib/server/logger';

export async function generateDocumentQuiz(documentId: number) {
    logger.info({ documentId }, 'Starting quiz generation');
    try {
        const [doc] = await db.select()
            .from(document)
            .where(eq(document.id, documentId));

        if (!doc) {
            logger.error({ documentId }, 'Document not found');
            throw new Error('Document not found');
        }

        logger.info({ 
            documentId, 
            filename: doc.filename, 
            mimeType: doc.mimeType 
        }, 'Found document');

        let content: string;
        try {
            if (doc.mimeType === 'text/plain') {
                logger.debug({ url: doc.url }, 'Fetching content from URL');
                const response = await fetch(doc.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
                }
                content = await response.text();
            } else {
                logger.debug({ documentId }, 'Fetching content from processed text');
                const [rawText] = await db.select()
                    .from(documentContent)
                    .where(
                        and(
                            eq(documentContent.documentId, documentId),
                            eq(documentContent.type, 'raw_text')
                        )
                    );

                if (!rawText) {
                    logger.error({ documentId }, 'No raw text found in database');
                    throw new Error('No raw text available for quiz generation');
                }
                content = rawText.content;
            }
            logger.debug({ contentLength: content.length }, 'Content retrieved');
        } catch (e) {
            logger.error({ err: e, documentId }, 'Failed to get content');
            throw e;
        }

        logger.info('Calling OpenAI API');
        const progressInterval = setInterval(() => {
            process.stdout.write('.');
        }, 1000);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a quiz generator that creates comprehensive quizzes based on document content.
Generate a mix of different question types that thoroughly test understanding of the content.

Create at least 3 questions, with a mix of:
1. Single-answer questions (one correct option)
2. Multiple-answers questions (more than one correct option)
3. True/False questions

You must respond with a valid JSON object and nothing else. Format your response as:
{
    "questions": [
        {
            "type": "single_answer",
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswers": [2],  // Array with single index of correct answer
            "explanation": "Why this answer is correct"
        },
        {
            "type": "multiple_answers",
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswers": [0, 2],  // Array of indices of correct answers
            "explanation": "Why these answers are correct"
        },
        {
            "type": "true_false",
            "question": "A statement that is true or false",
            "options": ["True", "False"],
            "correctAnswers": [0],  // 0 for True, 1 for False
            "explanation": "Why this statement is true/false"
        }
    ]
}`
                },
                {
                    role: "user",
                    content: `Generate a quiz based on this text:\n\n${content}`
                }
            ],
            temperature: 0.3
        });

        clearInterval(progressInterval);
        process.stdout.write('\n');

        const quizContent = response.choices[0].message.content;
        if (!quizContent) {
            throw new Error('No quiz content received from OpenAI');
        }

        logger.debug('Received OpenAI response');

        try {
            logger.debug('Parsing OpenAI response');
            const quizData = JSON.parse(quizContent) as { questions: QuizQuestion[] };
            logger.info({ questionCount: quizData.questions.length }, 'Parsed questions');

            const [newQuiz] = await db.insert(quiz)
                .values({
                    documentId,
                    title: `Quiz for ${doc.filename}`
                })
                .returning();

            logger.info({ quizId: newQuiz.id }, 'Created quiz');

            for (const q of quizData.questions) {
                logger.debug({ 
                    quizId: newQuiz.id,
                    questionPreview: q.question.substring(0, 50) 
                }, 'Creating question');
                
                const [newQuestion] = await db.insert(question)
                    .values({
                        quizId: newQuiz.id,
                        question: q.question,
                        type: q.type as QuestionType,
                        explanation: q.explanation
                    })
                    .returning();

                // Create options for this question
                await db.insert(option)
                    .values(q.options.map((text, index) => ({
                        questionId: newQuestion.id,
                        text,
                        isCorrect: q.correctAnswers.includes(index)
                    })));
            }

            logger.info({ 
                documentId, 
                quizId: newQuiz.id 
            }, 'Quiz generation completed successfully');
            return quizData.questions;

        } catch (parseError) {
            logger.error({ 
                err: parseError, 
                rawContent: quizContent 
            }, 'Failed to parse or store quiz');
            throw parseError;
        }

    } catch (error) {
        logger.error({ 
            err: error, 
            documentId 
        }, 'Fatal error in quiz generation');
        throw error;
    }
} 