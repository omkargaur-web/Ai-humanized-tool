const axios = require('axios');

exports.handler = async function(event, context) {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Preflight request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const userText = body.text;

        if (!userText) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Text is required" })
            };
        }

        // OpenRouter API Call
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "google/gemini-2.0-flash-lite-preview-02-05:free", 
                messages: [
                    {
                        role: "system",
                        content: "You are a professional human editor. Rewrite the following AI-generated text to make it sound 100% human, natural, and conversational. Maintain the original meaning but remove robotic patterns and vary sentence structure. Output only the rewritten text."
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 
                    'Content-Type': 'application/json'
                }
            }
        );

        const resultText = response.data.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: resultText })
        };

    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to humanize text. Check API key." })
        };
    }
};
