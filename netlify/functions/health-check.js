const axios = require('axios');

exports.handler = async function(event, context) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    try {
        // OpenRouter ko ek dummy request bhej kar key check karna
        const response = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                status: "Healthy", 
                message: "API Key is working",
                timestamp: new Date().toISOString() 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                status: "Unhealthy", 
                error: error.message 
            })
        };
    }
};
