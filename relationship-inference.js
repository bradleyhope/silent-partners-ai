/**
 * Relationship Inference Module
 * Uses reasoning models (o1-mini) to validate and type potential relationships
 */

console.log('🔍 relationship-inference.js loading...');

window.silentPartners = window.silentPartners || {};
window.silentPartners.relationshipInference = {

    /**
     * Infer missing relationships using o1-mini reasoning model
     */
    inferMissingRelationships: async function(candidates, entities, relationships, documentText, apiKey, model = 'gpt-4.1-mini') {
        console.log(`🤖 Starting relationship inference with ${model}...`);
        console.log(`📊 Analyzing ${candidates.length} candidate relationships`);
        
        if (!apiKey) {
            throw new Error('API key required for relationship inference');
        }
        
        if (candidates.length === 0) {
            console.log('⚠️ No candidates to analyze');
            return [];
        }
        
        // Prepare context for the model
        const context = this._prepareContext(candidates, entities, relationships, documentText);
        
        // Call AI model
        try {
            const inferredRelationships = await this._callReasoningModel(context, apiKey, model);
            
            console.log(`✅ Inference complete: ${inferredRelationships.length} relationships validated`);
            return inferredRelationships;
            
        } catch (error) {
            console.error('❌ Inference failed:', error);
            throw error;
        }
    },

    /**
     * Prepare context for the reasoning model
     */
    _prepareContext: function(candidates, entities, relationships, documentText) {
        // Limit document text to relevant excerpts (to save tokens)
        const relevantExcerpts = this._extractRelevantExcerpts(candidates, documentText);
        
        // Create entity lookup
        const entityMap = {};
        entities.forEach(e => {
            entityMap[e.id] = {
                name: e.name,
                type: e.type,
                description: e.description || ''
            };
        });
        
        // Format existing relationships
        const existingRels = relationships.map(r => ({
            source: entityMap[r.source]?.name || r.source,
            target: entityMap[r.target]?.name || r.target,
            type: r.type || 'unknown',
            description: r.description || ''
        }));
        
        // Format candidates
        const candidatesList = candidates.map(c => ({
            source: c.sourceName || entityMap[c.source]?.name || c.source,
            target: c.targetName || entityMap[c.target]?.name || c.target,
            confidence: c.confidence,
            method: c.method,
            evidence: Array.isArray(c.evidence) ? c.evidence.join(' | ') : c.evidence,
            sourceId: c.source,
            targetId: c.target
        }));
        
        return {
            entities: Object.values(entityMap),
            existingRelationships: existingRels,
            candidates: candidatesList,
            documentExcerpts: relevantExcerpts
        };
    },

    /**
     * Extract relevant excerpts from document for each candidate
     */
    _extractRelevantExcerpts: function(candidates, documentText) {
        if (!documentText) return '';
        
        const excerpts = new Set();
        const sentences = documentText.split(/[.!?]+/);
        
        candidates.forEach(candidate => {
            // Find sentences mentioning either entity
            const relevantSentences = sentences.filter(s => {
                const lower = s.toLowerCase();
                return (lower.includes(candidate.sourceName?.toLowerCase()) || 
                        lower.includes(candidate.targetName?.toLowerCase()));
            });
            
            relevantSentences.slice(0, 2).forEach(s => excerpts.add(s.trim()));
        });
        
        return Array.from(excerpts).join('. ');
    },

    /**
     * Call the reasoning model API
     */
    _callReasoningModel: async function(context, apiKey, model) {
        const prompt = this._buildPrompt(context);
        
        console.log(`📤 Sending request to ${model}...`);
        console.log(`📊 Prompt length: ${prompt.length} characters`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at analyzing network relationships and inferring implicit connections between entities. You provide structured JSON output.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent reasoning
                response_format: { type: "json_object" }
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${response.status} - ${error}`);
        }
        
        const data = await response.json();
        console.log(`📥 Received response from ${model}`);
        
        // Parse the response
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);
        
        return result.relationships || [];
    },

    /**
     * Build the prompt for the reasoning model
     */
    _buildPrompt: function(context) {
        return `You are analyzing a network of entities to find missing relationships.

ENTITIES:
${context.entities.map(e => `- ${e.name} (${e.type}): ${e.description}`).join('\n')}

EXISTING RELATIONSHIPS:
${context.existingRelationships.map(r => `- ${r.source} → ${r.target} [${r.type}]`).join('\n')}

POTENTIAL MISSING RELATIONSHIPS:
${context.candidates.map((c, i) => `${i + 1}. ${c.source} ↔ ${c.target}
   Confidence: ${(c.confidence * 100).toFixed(0)}%
   Method: ${c.method}
   Evidence: ${c.evidence}`).join('\n\n')}

DOCUMENT EXCERPTS:
${context.documentExcerpts}

TASK:
For each potential relationship, determine:
1. Does this relationship actually exist? (true/false)
2. If yes, what type is it? (financial, employment, personal, legal, association, ownership, etc.)
3. What is your confidence level? (0-100%)
4. What evidence supports it?

Consider:
- Do these entities appear in related contexts?
- Are they part of the same events or transactions?
- Do they share common connections that imply a direct link?
- Is there temporal overlap in their activities?
- Does the relationship make logical sense given their types and descriptions?

OUTPUT FORMAT (JSON):
{
  "relationships": [
    {
      "source": "Entity Name",
      "target": "Entity Name",
      "exists": true/false,
      "type": "relationship_type",
      "confidence": 85,
      "reasoning": "Brief explanation of why this relationship exists",
      "evidence": "Specific evidence from document or analysis"
    }
  ]
}

Only include relationships where exists=true. Be conservative - only validate relationships you're confident about.`;
    },

    /**
     * Format inferred relationships for addition to network
     */
    formatForNetwork: function(inferredRelationships, entities) {
        const entityNameToId = {};
        entities.forEach(e => {
            entityNameToId[e.name] = e.id;
        });
        
        return inferredRelationships
            .filter(r => r.exists === true)
            .map(r => ({
                source: entityNameToId[r.source] || r.source,
                target: entityNameToId[r.target] || r.target,
                type: r.type || 'association',
                status: 'inferred',
                description: r.reasoning || r.evidence || 'Inferred by AI analysis',
                confidence: r.confidence || 70,
                inferenceMethod: 'reasoning-model'
            }));
    },

    /**
     * Main function: complete inference pipeline
     */
    runInferencePipeline: async function(entities, relationships, documentText, apiKey, options = {}) {
        console.log('🚀 Starting relationship inference pipeline...');
        
        const {
            model = 'gpt-4.1-mini',
            minConfidence = 0.6,
            maxCandidates = 20
        } = options;
        
        try {
            // Step 1: Graph analysis to find candidates
            console.log('📊 Step 1: Graph analysis...');
            const candidates = window.silentPartners.graphAnalysis.analyzeMissingConnections(
                entities,
                relationships,
                documentText
            );
            
            if (candidates.length === 0) {
                console.log('⚠️ No candidates found');
                return {
                    success: true,
                    candidatesFound: 0,
                    relationshipsInferred: 0,
                    newRelationships: []
                };
            }
            
            // Step 2: Filter and limit candidates
            console.log('🔍 Step 2: Filtering candidates...');
            const filtered = window.silentPartners.graphAnalysis.filterByConfidence(
                candidates,
                minConfidence
            );
            
            const limited = filtered.slice(0, maxCandidates);
            console.log(`📊 Analyzing top ${limited.length} candidates (filtered from ${candidates.length})`);
            
            // Step 3: AI inference
            console.log('🤖 Step 3: AI reasoning...');
            const inferred = await this.inferMissingRelationships(
                limited,
                entities,
                relationships,
                documentText,
                apiKey,
                model
            );
            
            // Step 4: Format for network
            console.log('📝 Step 4: Formatting results...');
            const formatted = this.formatForNetwork(inferred, entities);
            
            console.log('✅ Inference pipeline complete!');
            console.log(`📊 Results: ${candidates.length} candidates → ${inferred.length} validated → ${formatted.length} added`);
            
            return {
                success: true,
                candidatesFound: candidates.length,
                candidatesAnalyzed: limited.length,
                relationshipsInferred: inferred.length,
                relationshipsAdded: formatted.length,
                newRelationships: formatted,
                allCandidates: candidates,
                analyzedCandidates: limited,
                inferredDetails: inferred
            };
            
        } catch (error) {
            console.error('❌ Inference pipeline failed:', error);
            return {
                success: false,
                error: error.message,
                candidatesFound: 0,
                relationshipsInferred: 0,
                newRelationships: []
            };
        }
    }
};

console.log('✅ relationship-inference.js loaded');
