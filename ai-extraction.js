/**
 * AI-Powered Network Extraction for Silent Partners
 * Extracts entities and relationships from text using LLM APIs
 */

(function() {
    'use strict';

    // Initialize namespace
    window.silentPartners = window.silentPartners || {};
    window.silentPartners.aiExtraction = {};

    // Configuration
    const CONFIG = {
        defaultModel: 'gpt-4.1-mini',
        maxTokens: 4000,
        temperature: 0.1, // Low temperature for consistent extraction
        openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
        models: {
            'gpt-4.1-mini': { provider: 'openai', name: 'gpt-4.1-mini' },
            'gpt-4.1-nano': { provider: 'openai', name: 'gpt-4.1-nano' },
            'gemini-2.5-flash': { provider: 'openai', name: 'gemini-2.5-flash' }
        }
    };

    // State management
    let state = {
        isExtracting: false,
        lastExtraction: null,
        apiKey: localStorage.getItem('openai_api_key') || ''
    };

    /**
     * Extraction prompt template
     */
    function buildExtractionPrompt(text) {
        return `You are an expert at extracting network data from investigative journalism and legal documents. Your task is to identify entities (people, organizations, locations, events) and their relationships.

ENTITY TYPES:
- person: Individual people (names, roles, descriptions)
- organization: Companies, government agencies, NGOs, institutions
- location: Countries, cities, addresses, jurisdictions
- event: Specific incidents, meetings, transactions, dates

RELATIONSHIP TYPES:
- financial: Money transfers, investments, ownership, payments, loans
- employment: Works for, board member, executive, consultant, advisor
- personal: Family, friends, associates, romantic relationships
- legal: Lawsuits, investigations, charges, indictments, convictions
- political: Government positions, appointments, influence, lobbying
- business: Partnerships, contracts, deals, joint ventures

RELATIONSHIP STATUS:
- confirmed: Documented, proven, admitted
- suspected: Alleged, rumored, under investigation
- former: Past relationship that has ended

INSTRUCTIONS:
1. Extract ALL entities mentioned in the text
2. Identify relationships between entities with clear evidence
3. Assign importance (1-5) based on centrality in the narrative
4. Include brief descriptions for context
5. Be conservative - only extract relationships with textual evidence
6. For financial relationships, include amounts if mentioned
7. Include date ranges if mentioned

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "entities": [
    {
      "name": "Full Name or Organization",
      "type": "person|organization|location|event",
      "importance": 1-5,
      "description": "Brief context about this entity"
    }
  ],
  "relationships": [
    {
      "source": "Entity Name (must match entity name exactly)",
      "target": "Entity Name (must match entity name exactly)",
      "type": "financial|employment|personal|legal|political|business",
      "description": "Brief description of the relationship",
      "status": "confirmed|suspected|former",
      "value": "Optional: monetary amount or other value",
      "date": "Optional: date or date range"
    }
  ]
}

TEXT TO ANALYZE:
${text}

Extract all entities and relationships. Return ONLY the JSON, no other text.`;
    }

    /**
     * Call OpenAI API for extraction
     */
    async function callOpenAI(text, model = CONFIG.defaultModel) {
        console.log('[AI Extraction] Starting extraction with model:', model);
        console.log('[AI Extraction] Text length:', text.length, 'characters');

        if (!state.apiKey) {
            throw new Error('OpenAI API key not configured. Please add your API key in the settings.');
        }

        const prompt = buildExtractionPrompt(text);
        
        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at extracting structured network data from text. Always return valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: CONFIG.temperature,
            max_tokens: CONFIG.maxTokens,
            response_format: { type: 'json_object' }
        };

        console.log('[AI Extraction] Sending request to OpenAI...');

        const response = await fetch(CONFIG.openaiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[AI Extraction] API Error:', errorData);
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('[AI Extraction] Received response');
        console.log('[AI Extraction] Usage:', data.usage);

        const content = data.choices[0].message.content;
        const extracted = JSON.parse(content);

        console.log('[AI Extraction] Extracted:', 
            extracted.entities?.length || 0, 'entities,',
            extracted.relationships?.length || 0, 'relationships');

        return extracted;
    }

    /**
     * Validate extracted data
     */
    function validateExtraction(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid extraction data: not an object');
        }

        if (!Array.isArray(data.entities)) {
            throw new Error('Invalid extraction data: entities must be an array');
        }

        if (!Array.isArray(data.relationships)) {
            throw new Error('Invalid extraction data: relationships must be an array');
        }

        // Validate entities
        data.entities.forEach((entity, idx) => {
            if (!entity.name || typeof entity.name !== 'string') {
                throw new Error(`Invalid entity at index ${idx}: missing or invalid name`);
            }
            if (!entity.type || !['person', 'organization', 'location', 'event'].includes(entity.type)) {
                console.warn(`Entity "${entity.name}" has invalid type, defaulting to "person"`);
                entity.type = 'person';
            }
            if (typeof entity.importance !== 'number') {
                entity.importance = 3; // Default importance
            }
        });

        // Validate relationships
        const entityNames = new Set(data.entities.map(e => e.name));
        data.relationships = data.relationships.filter((rel, idx) => {
            if (!rel.source || !rel.target) {
                console.warn(`Relationship at index ${idx} missing source or target, skipping`);
                return false;
            }
            if (!entityNames.has(rel.source)) {
                console.warn(`Relationship references unknown source: "${rel.source}", skipping`);
                return false;
            }
            if (!entityNames.has(rel.target)) {
                console.warn(`Relationship references unknown target: "${rel.target}", skipping`);
                return false;
            }
            if (!rel.type) {
                rel.type = 'business'; // Default type
            }
            if (!rel.status) {
                rel.status = 'confirmed'; // Default status
            }
            return true;
        });

        return data;
    }

    /**
     * Main extraction function
     */
    async function extractFromText(text, model = CONFIG.defaultModel) {
        if (state.isExtracting) {
            throw new Error('Extraction already in progress');
        }

        if (!text || text.trim().length < 50) {
            throw new Error('Text too short. Please provide at least 50 characters.');
        }

        state.isExtracting = true;

        try {
            const rawData = await callOpenAI(text, model);
            const validatedData = validateExtraction(rawData);
            
            state.lastExtraction = {
                timestamp: Date.now(),
                model: model,
                text: text,
                data: validatedData
            };

            console.log('[AI Extraction] Extraction complete');
            return validatedData;

        } catch (error) {
            console.error('[AI Extraction] Extraction failed:', error);
            throw error;
        } finally {
            state.isExtracting = false;
        }
    }

    /**
     * Set API key
     */
    function setApiKey(key) {
        state.apiKey = key;
        localStorage.setItem('openai_api_key', key);
        console.log('[AI Extraction] API key updated');
    }

    /**
     * Get API key (masked)
     */
    function getApiKeyMasked() {
        if (!state.apiKey) return '';
        return state.apiKey.substring(0, 7) + '...' + state.apiKey.substring(state.apiKey.length - 4);
    }

    /**
     * Clear API key
     */
    function clearApiKey() {
        state.apiKey = '';
        localStorage.removeItem('openai_api_key');
        console.log('[AI Extraction] API key cleared');
    }

    /**
     * Get extraction state
     */
    function getState() {
        return {
            isExtracting: state.isExtracting,
            hasApiKey: !!state.apiKey,
            lastExtraction: state.lastExtraction ? {
                timestamp: state.lastExtraction.timestamp,
                model: state.lastExtraction.model,
                entityCount: state.lastExtraction.data.entities.length,
                relationshipCount: state.lastExtraction.data.relationships.length
            } : null
        };
    }

    // Export public API
    window.silentPartners.aiExtraction = {
        extractFromText,
        setApiKey,
        getApiKeyMasked,
        clearApiKey,
        getState,
        CONFIG
    };

    console.log('[AI Extraction] Module loaded');

})();
