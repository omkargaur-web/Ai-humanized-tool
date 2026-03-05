exports.handler = async function(event, context) {
    const clientIP = event.headers['client-ip'] || 'unknown';
    const timestamp = new Date().toISOString();

    // Kyunki database nahi hai, hum sirf log kar sakte hain
    // Admin Netlify logs mein dekh sakta hai ki ek IP se kitni baar hit hua
    console.log(`[RATE-LIMIT-CHECK] IP: ${clientIP} at ${timestamp}`);

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            message: "Rate limit logged", 
            ip: clientIP 
        })
    };
};
