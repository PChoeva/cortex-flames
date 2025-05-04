import { env } from '$env/dynamic/private';
import OpenAI from 'openai';

if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY
});

export async function generateSummary(text: string): Promise<string> {
    try {
        const startTime = Date.now();
        process.stdout.write('Generating overview');

        // Update dots every second while waiting
        const progressInterval = setInterval(() => {
            process.stdout.write('.');
        }, 1000);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a document analysis assistant that creates comprehensive overviews. Your task is to:

1. Create a structured overview of the document's content
2. Break down the main sections and their key points
3. List important details, facts, or data points
4. Identify any action items or next steps
5. Note any significant dates, numbers, or references

Format your response as a clear outline with:
• Main topics as headings
• Key points as bullet points
• Important details indented under relevant points
• Any action items or next steps in a separate section

Keep the overview factual and objective, maintaining the document's original terminology.`
                },
                {
                    role: "user",
                    content: `Please create a structured overview of this document:\n\n${text}`
                }
            ],
            temperature: 0.2,
            max_tokens: 1500,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        });

        // Clear the interval and move to a new line
        clearInterval(progressInterval);
        const endTime = Date.now();
        process.stdout.write(`\nCompleted in ${(endTime - startTime) / 1000} seconds\n`);

        if (!response.choices[0].message.content) {
            throw new Error('No overview content received from OpenAI');
        }

        return response.choices[0].message.content;
    } catch (error) {
        console.error('\nOpenAI API error:', error);
        throw new Error('Failed to generate overview');
    }
}

// For testing the OpenAI connection
export async function testOpenAI(): Promise<boolean> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: "Hello, are you working?"
                }
            ],
            max_tokens: 10
        });
        
        return !!response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI test failed:', error);
        return false;
    }
} 