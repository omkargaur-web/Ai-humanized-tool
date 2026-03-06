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
        if (!userText || userText.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Empty input" })
            };
        }

        // POWERFUL FREE MODELS - Priority order exactly as specified
        const freeModels = [
            "google/gemini-flash-1.5-8b:free",           // Step 3.5 Flash Free (FASTEST)
            "meta-llama/llama-3.3-70b-instruct:free",    // Llama 3.3 70B Free (MOST POWERFUL)
            "nvidia/nemotron-4-12b:free",                 // Nemotron 12B Free
            "openchat/openchat-20b:free"                   // GPT-OSS-20B Free
        ];

        let finalResponse = null;
        let lastError = null;

        // Try models in priority order
        for (const modelId of freeModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: modelId,
                        messages: [
                            {
                                role: "system",
                                content: `You are a WORLD-CLASS text humanizer with 10+ years of experience in making AI text undetectable. Your expertise is converting robotic text into 100% human-like content.

## 🎯 PRIMARY MISSION:
Transform the input text into something a real person would naturally say/write, while preserving EXACT meaning - NOTHING MORE, NOTHING LESS.

## 🔍 STEP 1: DEEP TEXT ANALYSIS (Internal Only)
Before writing, analyze:
1. Core message? (Only this should remain)
2. Emotional tone? (Happy, sad, neutral, excited, formal, casual?)
3. Speaker profile? (Age, education, background implied)
4. Context? (Professional email, casual chat, social media, academic?)

## 🌐 STEP 2: LANGUAGE DETECTION & ADAPTATION (Internal Only)

### 🇺🇸 ENGLISH:
**Contractions (100% Natural):**
I am → I'm | You are → You're | Cannot → Can't | Will not → Won't
It is → It's | They have → They've | Should have → Should've
Would not → Wouldn't | Do not → Don't | Does not → Doesn't

**BANNED WORDS (NEVER USE):**
pivotal, tapestry, delve, foster, landscape, synergy, utilize, leverage, paradigm, optimize, facilitate, moreover, furthermore, consequently, thus, hence, endeavor, commence, myriad, robust, granular, proactive

**NATURAL ALTERNATIVES:**
Utilize → Use | Commence → Start/Begin | Endeavor → Try
Nevertheless → But/Still/Though | Therefore → So | Regarding → About

**FILLERS (ONLY if text is conversational, MAX 2 total):**
well, actually, honestly, basically, I mean, you know, look

### 🇮🇳 HINDI / HINGLISH:
**NO SHUDDH HINDI:**
❌ Atyant → ✅ Bahut
❌ Mahatvapoorn → ✅ Important/Zaroori
❌ Kripya → ✅ Please
❌ Tathya → ✅ Sach

**NATURAL HINGLISH:**
"Kaafi acha laga" (not "Atyant sukhad anubhav hua")
"Mujhe lagta hai..." (not "Mama anubhav hota hai...")

**FILLERS (Context-Aware):**
- Casual: bhai, yaar, waise, matlab, dekho (MAX 1 use)
- DON'T force bhai/yaar in formal text

### 🇫🇷 FRENCH | 🇩🇪 GERMAN | 🇮🇹 ITALIAN | 🇪🇸 SPANISH:
Apply natural conversational patterns of that language
Use common contractions and informal structures
Keep original meaning intact

## 📊 STEP 3: UNIVERSAL HUMANIZATION RULES

### ✍️ SENTENCE ARCHITECTURE:
- Length Variation: Short (2-5) → Medium (6-15) → Long (16-25) → Short
- Structure Variety: Simple → Compound → Complex → Simple
- Start Variety: Never start 2 consecutive sentences with same word

### ✅ DO:
- Keep EXACT same meaning as input
- Make it flow naturally like a real person
- Use appropriate contractions for the language
- Vary sentence length slightly
- Grammar fixes (if needed)
- Word choice (formal → natural alternatives)

### ❌ DON'T:
- Add ANY new information, opinions, or thoughts
- Add "honestly", "basically", "I mean" if not in original
- Add "bhai/yaar" to formal Hindi text
- Add uncertainty like "I think" or "maybe" if original is confident
- Create fake self-corrections or "memory glitches"
- Add dramatic punctuation or ellipsis unnecessarily
- Add personal opinions: "I love this name"
- Add fictional thoughts: "I never thought about it"
- Add fake emotions: "I'm so excited to say..."

### 🚫 NEVER USE THESE AI-PATTERNS:
"It is worth noting that..." | "It is important to mention..."
"One could argue that..." | "In today's world..."
"The fact of the matter is..." | "It goes without saying..."

## 🎯 OUTPUT RULES:

- **ONLY the humanized text**
- **NO meta-commentary**
- **NO explanations**
- **NO language detection line**
- **NO notes**
- **JUST THE TEXT, NOTHING ELSE**

## 💡 REAL EXAMPLES:

Input: "Omkar gaur is my name"
❌ BAD: "Bhai, my name is Omkar Gaur yaar, honestly I think it's a cool name..."
✅ GOOD: "I'm Omkar Gaur." OR "My name is Omkar Gaur."

Input: "Mera naam Omkar hai"
❌ BAD: "Bhai, mera naam Omkar hai yaar, waise bahut achha naam hai..."
✅ GOOD: "Mera naam Omkar hai." OR "Main Omkar hoon."

Input: "I am going to market"
❌ BAD: "So basically, I'm heading to the market, you know, to get some stuff."
✅ GOOD: "I'm going to the market."

## 🔑 KEY PRINCIPLE:
**If input is 5 words, output should be 5-8 words MAX.**
**Every word in output must map to meaning in input.**

Remember: You are a text POLISHER, not a text EXPANDER.`
                            },
                            { 
                                role: "user", 
                                content: userText
                            }
                        ],
                        temperature: 0.75,  // Balanced between creativity and control
                        top_p: 0.9,
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': 'https://fabulous-truffle-ddfbf6.netlify.app',
                            'X-Title': 'AI Humanizer Pro'
                        },
                        timeout: 45000  // Increased timeout for larger models
                    }
                );

                if (response.data?.choices?.[0]?.message?.content) {
                    let rawOutput = response.data.choices[0].message.content;
                    
                    // Aggressive cleaning - remove ANY meta text
                    finalResponse = rawOutput
                        .replace(/^(Detected language:.*\n?)/gi, '')
                        .replace(/^(Language detected:.*\n?)/gi, '')
                        .replace(/^(Note:|Note :|Explanation:|\[Note:|\(Note:)/gi, '')
                        .replace(/\(Note:[\s\S]*?\)/gi, '')
                        .replace(/\[Note:[\s\S]*?\]/gi, '')
                        .replace(/^I think\s+/i, '')     // Remove accidental "I think"
                        .replace(/^Honestly,\s+/i, '')   // Remove accidental "Honestly"
                        .replace(/^Basically,\s+/i, '')  // Remove accidental "Basically"
                        .replace(/^You know,\s+/i, '')   // Remove accidental "You know"
                        .replace(/^I mean,\s+/i, '')     // Remove accidental "I mean"
                        .replace(/\s{2,}/g, ' ')         // Fix multiple spaces
                        .replace(/\n{3,}/g, '\n\n')      // Fix multiple newlines
                        .trim();
                    
                    // Check if output is valid and not just repeating input
                    if (finalResponse && finalResponse.length > 0) {
                        // Make sure we didn't get the exact same text
                        if (finalResponse.toLowerCase() !== userText.toLowerCase()) {
                            console.log(`Success with model: ${modelId}`);
                            break;  // Success! Exit the loop
                        } else {
                            console.log(`Model ${modelId} returned identical text, trying next...`);
                        }
                    }
                }
            } catch (err) {
                console.error(`Model ${modelId} failed:`, err.message);
                lastError = err.message;
                continue;  // Try next model
            }
        }

        // FALLBACK: If all models fail, use simple humanization
        if (!finalResponse) {
            console.log("All models failed, using fallback. Last error:", lastError);
            finalResponse = simpleHumanize(userText);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: finalResponse })
        };

    } catch (error) {
        console.error("Fatal error:", error);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                output: simpleHumanize(body?.text || "Error processing text") 
            })
        };
    }
};

// Smart fallback humanization
function simpleHumanize(text) {
    if (!text) return "";
    
    let result = text.trim();
    
    // Don't process very short text
    if (result.length < 3) return result;
    
    // Handle name introductions (common case)
    const nameIntroPatterns = [
        // English patterns
        { from: /\bmy name is\s+(\w+(?:\s+\w+)?)/i, to: "I'm $1" },
        { from: /\bi am\s+(\w+(?:\s+\w+)?)/i, to: "I'm $1" },
        { from: /\bthis is\s+(\w+(?:\s+\w+)?)/i, to: "I'm $1" },
        
        // Hindi/Hinglish patterns
        { from: /\bmera naam\s+(\w+(?:\s+\w+)?)\s+hai/i, to: "Main $1 hoon" },
        { from: /\bmai\s+(\w+(?:\s+\w+)?)\s+hoon/i, to: "Main $1 hoon" },
        { from: /\bnaam\s+(\w+(?:\s+\w+)?)\s+hai/i, to: "Mera naam $1 hai" },
        
        // Common English contractions (only if they make sense)
        { from: /\bI am\b(?!\s+going\s+to\b)/i, to: "I'm" },  // Avoid "I'm going to" -> "I'm going to" is fine
        { from: /\byou are\b/i, to: "you're" },
        { from: /\bhe is\b/i, to: "he's" },
        { from: /\bshe is\b/i, to: "she's" },
        { from: /\bit is\b/i, to: "it's" },
        { from: /\bwe are\b/i, to: "we're" },
        { from: /\bthey are\b/i, to: "they're" },
        { from: /\bcannot\b/i, to: "can't" },
        { from: /\bwill not\b/i, to: "won't" },
        { from: /\bdo not\b/i, to: "don't" },
        { from: /\bdoes not\b/i, to: "doesn't" },
        { from: /\bis not\b/i, to: "isn't" },
        { from: /\bare not\b/i, to: "aren't" },
        { from: /\bwas not\b/i, to: "wasn't" },
        { from: /\bwere not\b/i, to: "weren't" },
        { from: /\bhas not\b/i, to: "hasn't" },
        { from: /\bhave not\b/i, to: "haven't" },
        { from: /\bhad not\b/i, to: "hadn't" },
        { from: /\bwill not\b/i, to: "won't" },
        { from: /\bwould not\b/i, to: "wouldn't" },
        { from: /\bshould not\b/i, to: "shouldn't" },
        { from: /\bcould not\b/i, to: "couldn't" },
        { from: /\bmight not\b/i, to: "mightn't" }
    ];
    
    // Apply patterns
    for (const pattern of nameIntroPatterns) {
        result = result.replace(pattern.from, pattern.to);
    }
    
    // Clean up extra spaces
    result = result.replace(/\s{2,}/g, ' ').trim();
    
    // If no changes made and text is English, add basic punctuation if missing
    if (result === text.trim() && !/[.!?]$/.test(result) && /[a-zA-Z]/.test(result)) {
        result = result + '.';
    }
    
    return result;
}
