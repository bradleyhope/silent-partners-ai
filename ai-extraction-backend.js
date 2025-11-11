/**
 * AI Extraction - Backend API Version
 * Uses server-side OpenAI key via backend API
 */

(function() {
    'use strict';

    // API endpoint configuration
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://silent-partners-ai-api.onrender.com';

    /**
     * Wake up the API if it's sleeping (Render free tier cold start)
     */
    async function wakeUpAPI() {
        try {
            console.log('[AI Backend] Waking up API...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
            
            const response = await fetch(`${API_BASE_URL}/api/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('[AI Backend] API is awake and ready');
                return true;
            }
            return false;
        } catch (error) {
            console.warn('[AI Backend] API wake-up failed:', error.message);
            return false;
        }
    }

    /**
     * Extract network from text using backend API
     */
    async function extractNetwork(text, model = 'gpt-4.1-mini') {
        // Wake up API first to avoid cold start timeout
        await wakeUpAPI();
        
        const apiUrl = `${API_BASE_URL}/api/extract`;
        console.log('[AI Backend] Making request to:', apiUrl);
        console.log('[AI Backend] Request payload:', { text: text.substring(0, 100) + '...', model });
        
        try {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model: model
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            console.log('[AI Backend] Response status:', response.status);
            console.log('[AI Backend] Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorMessage = 'Extraction failed';
                try {
                    const error = await response.json();
                    errorMessage = error.error || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('[AI Backend] Extraction successful:', result);
            return result;

        } catch (error) {
            console.error('[AI Backend] Extraction error:', error);
            console.error('[AI Backend] Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                apiUrl: apiUrl
            });
            
            // Provide more helpful error messages
            let userMessage = error.message;
            if (error.message === 'Failed to fetch') {
                userMessage = 'Cannot connect to API server. The server may be waking up - please try again in 10 seconds.';
            } else if (error.name === 'AbortError') {
                userMessage = 'Request timed out. The server may be starting up - please try again.';
            } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
                userMessage = 'Network error: Unable to reach the API server.';
            } else if (error.message.includes('Load failed')) {
                userMessage = 'Connection failed. The server may be waking up - please wait 10 seconds and try again.';
            }
            
            throw new Error(userMessage);
        }
    }

    /**
     * Infer missing relationships using backend API
     */
    async function inferRelationships(entities, relationships, originalText, model = 'gpt-4.1-mini') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/infer`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entities: entities,
                    relationships: relationships,
                    text: originalText,
                    model: model
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Inference failed');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('[AI Backend] Inference error:', error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async function testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            const data = await response.json();
            console.log('[AI Backend] API connection OK:', data);
            return true;
        } catch (error) {
            console.error('[AI Backend] API connection failed:', error);
            return false;
        }
    }

    // Expose API
    window.silentPartners = window.silentPartners || {};
    window.silentPartners.aiBackend = {
        extractNetwork,
        inferRelationships,
        testConnection,
        API_BASE_URL
    };

    // Test connection on load
    testConnection();

    console.log('[AI Backend] Backend API module loaded');
})();
