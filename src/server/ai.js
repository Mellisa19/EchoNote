const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateSummary(text, type = 'meeting') {
    if (!text || text.length < 10) return 'No transcript available for summary';
    
    try {
        const prompt = type === 'meeting' 
            ? "Summarize this meeting transcript in 2-3 sentences, focusing on key decisions and outcomes."
            : "Summarize this transcript, identifying key points, decisions made, and action items. Format the response with clear sections.";

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text.substring(0, 3000) }
            ],
            max_tokens: 500,
            temperature: 0.7
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Summary generation error:', error);
        return 'Summary generation failed';
    }
}

async function extractActionItems(text) {
    if (!text) return [];
    
    // Simple extraction logic (can be upgraded to GPT later)
    const actionPhrases = ['action item', 'to do', 'will do', 'should', 'need to', 'assigned to'];
    const actionItems = [];
    
    const lines = text.split(/[.!?\n]/);
    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (actionPhrases.some(phrase => lowerLine.includes(phrase))) {
            actionItems.push({
                task: line.trim(),
                assignee: 'Unassigned',
                deadline: null
            });
        }
    });
    
    return actionItems;
}

async function analyzeSentiment(text) {
    if (!text || text.length < 10) return null;
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Analyze the sentiment of this text. Return a JSON object with overall sentiment (positive/neutral/negative) and confidence score (0-1)."
                },
                { role: "user", content: text.substring(0, 1000) }
            ],
            max_tokens: 100,
            temperature: 0.3
        });
        
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return { sentiment: 'neutral', confidence: 0.5 };
    }
}

async function extractKeyTopics(text) {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
        if (word.length > 5) { // Common filter for topics
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    });
    
    return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

module.exports = {
    generateSummary,
    extractActionItems,
    analyzeSentiment,
    extractKeyTopics
};
