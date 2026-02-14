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

        // Diagnostic Check: Kya key mil rahi hai?
        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Netlify Variable 'OPENROUTER_API_KEY' not found!" })
            };
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "google/gemini-2.0-flash-lite-preview-02-05:free", 
                messages: [
                    {
                        role: "system",
                        content: "You are a professional human editor. Rewrite the following text to make it sound 100% human and natural. Output only the rewritten text."
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`, 
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds wait time
            }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: response.data.choices[0].message.content })
        };

    } catch (error) {
        // Asli error kya hai wo yahan dikhega
        const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("API Error:", errorDetail);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: "API Issue", 
                detail: errorDetail 
            })
        };
    }
};
