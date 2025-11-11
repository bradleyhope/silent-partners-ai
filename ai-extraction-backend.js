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
     * Extract network from text using backend API
     */
    async function extractNetwork(text, model = 'gpt-4.1-mini') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model: model
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Extraction failed');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('[AI Backend] Extraction error:', error);
            throw error;
        }
    }

    /**
     * Infer missing relationships using backend API
     */
    async function inferRelationships(entities, relationships, originalText, model = 'gpt-4.1-mini') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/infer`, {
                method: 'POST',
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
