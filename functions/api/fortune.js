/**
 * Cloudflare Pages Function - Secure Backend Proxy for Gemini API
 * This handler runs securely on the Cloudflare edge network,
 * reading the GEMINI_API_KEY from encrypted environment variables,
 * making the request to Google Gemini, and returning the result.
 */

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // 1. Read the API key from environment variables
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: "GEMINI_API_KEY is not configured on Cloudflare.",
                code: "NO_API_KEY"
            }), { 
                status: 400,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        // 2. Clone the request body to forward
        const body = await request.json();
        
        // 3. Make the secure server-side call to Google Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ 
                error: "Gemini API failed on server side", 
                details: errText 
            }), { 
                status: response.status,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
        
    } catch (err) {
        return new Response(JSON.stringify({ 
            error: "Internal Server Error", 
            message: err.message 
        }), { 
            status: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}

// Enable CORS Preflight Requests for testing purposes
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400"
        }
    });
}
