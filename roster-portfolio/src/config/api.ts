// API Configuration
// In production, this points to the Cloudflare tunnel URL
// In development, it points to localhost

const getApiUrl = (): string => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
        // In production (deetalk.win), use the API subdomain
        if (window.location.hostname === 'deetalk.win' || window.location.hostname === 'www.deetalk.win') {
            return 'https://api.deetalk.win';
        }
    }
    // Default to localhost for development
    return 'http://localhost:8000';
};

export const API_URL = getApiUrl();
export const API_CHAT_ENDPOINT = `${API_URL}/api/chat`;
export const API_INGEST_ENDPOINT = `${API_URL}/api/ingest`;
