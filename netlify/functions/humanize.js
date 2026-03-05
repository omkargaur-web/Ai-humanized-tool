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

        // Priority list of models (Free to Paid)
        const modelList = [
            "google/gemma-2-9b-it:free",              // Priority 1: High Stability
            "mistralai/mistral-7b-instruct:free",     // Priority 2: Fast Speed
            "meta-llama/llama-3.1-8b-instruct:free",  // Priority 3: Good Quality
            "meta-llama/llama-3.1-70b-instruct"       // Priority 4: Paid (Ultimate Backup)
        ];

        let lastResponse = null;
        let lastError = null;

        // Auto-switch Logic: Har model ko bari-bari try karega
        for (const modelId of modelList) {
            try {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: modelId,
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

🌐 IF DETECTED = HINDI / HINGLISH:
- NO shuddh Hindi: atyant→bahut, mahatvapoorn→important
- Natural Hinglish mix: "Kaafi weird experience tha yaar"
- Fillers: bhai, dekho, yaar, sacchi, waise, matlab

🌐 IF DETECTED = FRENCH, GERMAN, ITALIAN, SPANISH:
- Apply native informal fillers, slang, and regional markers.

STEP 3: APPLY UNIVERSAL HUMANIZATION RULES (ALL LANGUAGES)
📱 HUMAN ERROR PROTOCOL: Typos (1 per 150 words), irregular paragraphs, NO formatting.
🌀 CHAOS ARCHITECTURE: Vary sentence patterns (short/long), fragments, start variety.
🧠 MEMORY GLITCH: Use "I think...", "Wait, no...", opinionated tone.
🔤 PUNCTUATION: Ellipsis..., brackets (like this), em-dashes.

STEP 4: OUTPUT
- Language: Same as input
- Format: Raw text only, NO explanations
- Quality: 0% AI detection target`
                            },
                            { role: "user", content: userText }
                        ],
                        temperature: 0.95,
                        top_p: 1,
                        frequency_penalty: 0.3,
                        presence_penalty: 0.3
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': 'https://your-netlify-app-url.com',
                            'X-Title': 'Multilingual Humanizer',
                            'Content-Type': 'application/json'
                        },
                        timeout: 35000 // Each attempt max 35 seconds
                    }
                );

                if (response.data && response.data.choices) {
                    lastResponse = response.data.choices[0].message.content;
                    break; // Success! Loop se bahar nikal jao
                }
            } catch (error) {
                lastError = error;
                console.error(`Model ${modelId} failed. Trying next...`);
                // Loop chalta rahega jab tak koi model kaam na kare
            }
        }

        if (lastResponse) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ output: lastResponse })
            };
        } else {
            throw new Error(lastError ? lastError.message : "All models failed");
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: "All Models Failed (Connectivity)", 
                detail: error.message 
            })
        };
    }
};
