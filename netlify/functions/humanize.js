const axios = require('axios');

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const body = JSON.parse(event.body || '{}');
        const userText = body.text;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) throw new Error("API Key missing in Netlify settings");

        // Priority Model List: Optimized for Stability & Cost
        const modelList = [
            "google/gemma-2-9b-it:free", 
            "mistralai/mistral-7b-instruct:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "meta-llama/llama-3.1-70b-instruct" // Paid backup
        ];

        let finalResponse = null;

        for (const modelId of modelList) {
            try {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: modelId,
                        messages: [
                            {
                                role: "system",
                                content: `### ROLE: Multilingual Humanization Expert
### TASK: Rewrite user text to pass AI detectors with 0% score.

### STRICT OUTPUT RULES (MANDATORY):
1. DO NOT output "Detected language" or any meta-data.
2. DO NOT provide explanations, notes, or introductions.
3. ONLY output the rewritten text itself.
4. Use natural human patterns: high perplexity, bursty sentence lengths, and informal fillers (bhai, yaar, honestly, basically).
5. If HINGLISH: Mix Hindi/English naturally. Avoid formal 'Shuddh' Hindi.
6. If ENGLISH: Use 100% contractions and remove corporate jargon (pivotal, tapestry, delve).
7. Apply human-like chaos: minor typos, fragments, and emotional shifts (skepticism, excitement).

### FINAL FORMAT: Raw text only. No prefixes. No suffixes.`
                            },
                            { role: "user", content: userText }
                        ],
                        temperature: 0.94,
                        top_p: 1,
                        frequency_penalty: 0.4 // Over-repetition rokne ke liye
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': 'https://fabulous-truffle-ddfbf6.netlify.app',
                            'X-Title': 'AI Humanizer V2'
                        },
                        timeout: 35000 
                    }
                );

                if (response.data?.choices?.[0]?.message?.content) {
                    let rawOutput = response.data.choices[0].message.content;
                    
                    // --- FAIL-SAFE CLEANING (Purani galtiyon ko rokne ke liye) ---
                    finalResponse = rawOutput
                        .replace(/Detected language:.*\n?/gi, "") // Remove detection line
                        .replace(/\(Note:[\s\S]*?\)/gi, "")       // Remove bracketed notes
                        .replace(/\[Note:[\s\S]*?\]/gi, "")
                        .replace(/^(Note:|Note :|Explanation:)/gi, "")
                        .replace(/\n\(Note:[\s\S]*/gi, "")        // Remove trailing notes
                        .trim();
                    
                    if (finalResponse) break; 
                }
            } catch (err) {
                console.error(`Model ${modelId} failed:`, err.message);
                continue; 
            }
        }

        return {
            statusCode: finalResponse ? 200 : 500,
            headers,
            body: JSON.stringify(finalResponse ? { output: finalResponse } : { error: "Models exhausted" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "System Error", detail: error.message })
        };
    }
};
