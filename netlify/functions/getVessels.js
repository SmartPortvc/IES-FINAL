import { fetchAllVessels } from "./vesselService.js";

export const handler = async (event, context) => {
    // CORS Headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers
        };
    }

    try {
        const apiKey = event.headers["x-api-key"] || event.headers["X-API-Key"];

        // Security Check
        if (!apiKey || apiKey !== process.env.API_KEY) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: "Unauthorized: Invalid or missing API Key"
                }),
            };
        }

        if (event.httpMethod !== "GET") {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
            };
        }

        const vessels = await fetchAllVessels();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                count: vessels.length,
                data: vessels
            }),
        };
    } catch (error) {
        console.error("Error in getVessels function:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: "Internal Server Error",
                message: error.message
            }),
        };
    }
};
