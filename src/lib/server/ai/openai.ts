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
        console.log('Sending request to OpenAI for summary generation');
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates concise summaries. Keep summaries clear and under 250 words."
                },
                {
                    role: "user",
                    content: `Please summarize the following text:\n\n${text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        console.log('Received response from OpenAI');

        if (!response.choices[0].message.content) {
            throw new Error('No summary content received from OpenAI');
        }

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate summary');
    }
}

// For testing the OpenAI connection
export async function testOpenAI(): Promise<boolean> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
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