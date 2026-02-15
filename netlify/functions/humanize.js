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
        
        // Netlify dashboard se key read karna
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: "Configuration Error", 
                    detail: "Netlify dashboard par OPENROUTER_API_KEY nahi mili. Kripya redeploy karein." 
                })
            };
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "google/gemini-2.0-flash-exp:free", 
                messages: [
                    {
                        role: "system",
                        content: "You are a professional human editor. Rewrite the text to be 100% human-like. Output only rewritten text."
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
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://netlify.app'
                },
                timeout: 30000 
            }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: response.data.choices[0].message.content })
        };

    } catch (error) {
        const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
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
