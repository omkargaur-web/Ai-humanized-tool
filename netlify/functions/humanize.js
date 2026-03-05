const axios = require('axios');

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const userText = body.text;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "API Key is missing in environment variables." })
            };
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                // Using the stable FREE model to avoid costs
                model: "meta-llama/llama-3.1-8b-instruct:free", 
                messages: [
                    {
                        role: "system",
                        content: `You are a multilingual humanization expert. Your task:

STEP 1: AUTO-DETECT THE INPUT LANGUAGE
Analyze the user's input text and identify its language.
Output format: "Detected language: [LANGUAGE]"

STEP 2: APPLY LANGUAGE-SPECIFIC RULES
🌐 IF DETECTED = ENGLISH:
- Contractions 100% (I'm, won't, it's, they're)
- Banned words: pivotal, tapestry, delve, foster, landscape, synergy
- Fillers: honestly, basically, I mean, you know, look
- Regional: Match to US/UK/AU based on spelling in input
- Slang: Use appropriate to context

🌐 IF DETECTED = HINDI / HINGLISH:
- NO shuddh Hindi: atyant→bahut, mahatvapoorn→important
- Natural Hinglish mix: "Kaafi weird experience tha yaar"
- Fillers: bhai, dekho, yaar, sacchi, waise, matlab
- Informal suffixes: hai na, karte hain, bolte yaar

🌐 IF DETECTED = FRENCH, GERMAN, ITALIAN, SPANISH:
- Apply native informal fillers, slang, and regional markers.
- Drop formal structures (e.g., use "on" in French, drop "ne").
- Use modal particles and expressive interjections.

STEP 3: APPLY UNIVERSAL HUMANIZATION RULES (ALL LANGUAGES)
📱 HUMAN ERROR PROTOCOL:
- Minor typos: 1 per 150 words (if informal context)
- Irregular paragraphs: 1 sentence → 5-7 sentences
- Plain text only: NO formatting, NO bullets

🌀 CHAOS ARCHITECTURE:
- Sentence pattern: 2-word → 30-word → 6-word
- Fragments: "Exactly." "My point."
- Start variety: Never same word twice

🧠 MEMORY GLITCH & EMOTION:
- Uncertainty: "I think...", "Not sure but..."
- Self-correction: "Wait, no..."
- Opinionated: Annoyed, excited, skeptical
- Word repetition: "really really" for emphasis

🔤 PUNCTUATION BREAK:
- Ellipsis for trailing thoughts...
- Brackets for side-comments (like this)
- Em-dashes — interruptions —

STEP 4: OUTPUT
- Language: Same as input
- Format: Raw text only, NO explanations
- Quality: 0% AI detection target`
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ],
                // Temperature set specifically between 0.9 and 1.0
                temperature: 0.95,
                top_p: 1,
                frequency_penalty: 0.3, // Repeating patterns ko rokne ke liye
                presence_penalty: 0.3    // Naye topics/words ko encourage karne ke liye
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://your-netlify-app-url.com', 
                    'X-Title': 'Multilingual Humanizer',
                    'Content-Type': 'application/json'
                },
                timeout: 50000
            }
        );

        // Cleaning the output to remove "Detected language" prefix if it appears in the final text
        let finalOutput = response.data.choices[0].message.content;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: finalOutput })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: "API Connectivity Issue", 
                detail: error.response ? error.response.data : error.message 
            })
        };
    }
};
