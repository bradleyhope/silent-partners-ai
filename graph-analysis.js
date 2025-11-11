/**
 * Graph Analysis Module
 * Finds potential missing relationships using algorithmic approaches
 */

console.log('🔍 graph-analysis.js loading...');

window.silentPartners = window.silentPartners || {};
window.silentPartners.graphAnalysis = {

    /**
     * Find entities that co-occur in the same sentences
     * Entities mentioned together are likely connected
     */
    findCoOccurrences: function(entities, documentText) {
        console.log('📊 Finding co-occurrences...');
        
        if (!documentText || !entities || entities.length === 0) {
            return [];
        }

        const candidates = [];
        
        // Split into sentences
        const sentences = documentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        sentences.forEach((sentence, sentenceIndex) => {
            // Find which entities appear in this sentence
            const entitiesInSentence = entities.filter(entity => {
                const nameVariants = [
                    entity.name,
                    entity.name.toLowerCase(),
                    // Handle "Jho Low" vs "Low Taek Jho" type variations
                    ...entity.name.split(' ')
                ];
                return nameVariants.some(variant => 
                    sentence.toLowerCase().includes(variant.toLowerCase())
                );
            });
            
            // Create candidates for each pair
            for (let i = 0; i < entitiesInSentence.length; i++) {
                for (let j = i + 1; j < entitiesInSentence.length; j++) {
                    candidates.push({
                        source: entitiesInSentence[i].id,
                        sourceName: entitiesInSentence[i].name,
                        target: entitiesInSentence[j].id,
                        targetName: entitiesInSentence[j].name,
                        confidence: 0.6,
                        method: 'co-occurrence',
                        evidence: sentence.trim(),
                        sentenceIndex: sentenceIndex
                    });
                }
            }
        });
        
        // Deduplicate and aggregate
        const aggregated = this._aggregateCandidates(candidates);
        
        console.log(`📊 Found ${aggregated.length} co-occurrence candidates`);
        return aggregated;
    },

    /**
     * Find transitive connections: if A→B and B→C, then A might connect to C
     */
    findTransitiveConnections: function(entities, relationships) {
        console.log('🔗 Finding transitive connections...');
        
        if (!relationships || relationships.length === 0) {
            return [];
        }

        const candidates = [];
        const existingConnections = new Set();
        
        // Build set of existing connections
        relationships.forEach(rel => {
            existingConnections.add(`${rel.source}-${rel.target}`);
            existingConnections.add(`${rel.target}-${rel.source}`);
        });
        
        // Find transitive paths
        relationships.forEach(rel1 => {
            relationships.forEach(rel2 => {
                // Check if rel1.target === rel2.source (A→B, B→C)
                if (rel1.target === rel2.source && rel1.source !== rel2.target) {
                    const connectionKey = `${rel1.source}-${rel2.target}`;
                    
                    // Only add if connection doesn't already exist
                    if (!existingConnections.has(connectionKey)) {
                        const sourceEntity = entities.find(e => e.id === rel1.source);
                        const targetEntity = entities.find(e => e.id === rel2.target);
                        const viaEntity = entities.find(e => e.id === rel1.target);
                        
                        if (sourceEntity && targetEntity && viaEntity) {
                            candidates.push({
                                source: rel1.source,
                                sourceName: sourceEntity.name,
                                target: rel2.target,
                                targetName: targetEntity.name,
                                confidence: 0.7,
                                method: 'transitive',
                                evidence: `${rel1.type || 'connected'} via ${viaEntity.name}, then ${rel2.type || 'connected'}`,
                                via: viaEntity.name,
                                viaId: viaEntity.id,
                                path: [rel1.source, rel1.target, rel2.target]
                            });
                        }
                    }
                }
            });
        });
        
        // Deduplicate
        const aggregated = this._aggregateCandidates(candidates);
        
        console.log(`🔗 Found ${aggregated.length} transitive candidates`);
        return aggregated;
    },

    /**
     * Find entities that share common connections (community detection)
     */
    findSharedConnections: function(entities, relationships) {
        console.log('🌐 Finding shared connections...');
        
        if (!relationships || relationships.length === 0) {
            return [];
        }

        const candidates = [];
        const existingConnections = new Set();
        
        // Build connection map: entity -> [connected entities]
        const connectionMap = new Map();
        
        relationships.forEach(rel => {
            existingConnections.add(`${rel.source}-${rel.target}`);
            existingConnections.add(`${rel.target}-${rel.source}`);
            
            if (!connectionMap.has(rel.source)) {
                connectionMap.set(rel.source, new Set());
            }
            if (!connectionMap.has(rel.target)) {
                connectionMap.set(rel.target, new Set());
            }
            
            connectionMap.get(rel.source).add(rel.target);
            connectionMap.get(rel.target).add(rel.source);
        });
        
        // Find entities with shared connections
        entities.forEach(entity1 => {
            entities.forEach(entity2 => {
                if (entity1.id >= entity2.id) return; // Avoid duplicates
                
                const connectionKey = `${entity1.id}-${entity2.id}`;
                if (existingConnections.has(connectionKey)) return; // Already connected
                
                const connections1 = connectionMap.get(entity1.id) || new Set();
                const connections2 = connectionMap.get(entity2.id) || new Set();
                
                // Find shared connections
                const shared = [...connections1].filter(c => connections2.has(c));
                
                if (shared.length >= 2) { // At least 2 shared connections
                    const sharedEntities = shared.map(id => 
                        entities.find(e => e.id === id)?.name
                    ).filter(Boolean);
                    
                    candidates.push({
                        source: entity1.id,
                        sourceName: entity1.name,
                        target: entity2.id,
                        targetName: entity2.name,
                        confidence: Math.min(0.5 + (shared.length * 0.1), 0.9),
                        method: 'shared-connections',
                        evidence: `Both connected to: ${sharedEntities.join(', ')}`,
                        sharedCount: shared.length,
                        sharedWith: sharedEntities
                    });
                }
            });
        });
        
        console.log(`🌐 Found ${candidates.length} shared connection candidates`);
        return candidates;
    },

    /**
     * Find entities of same type that appear in similar contexts
     */
    findSimilarContexts: function(entities, documentText) {
        console.log('📝 Finding similar contexts...');
        
        if (!documentText || !entities || entities.length === 0) {
            return [];
        }

        const candidates = [];
        const existingConnections = new Set();
        
        // Group entities by type
        const typeGroups = {};
        entities.forEach(entity => {
            const type = entity.type || 'unknown';
            if (!typeGroups[type]) {
                typeGroups[type] = [];
            }
            typeGroups[type].push(entity);
        });
        
        // For each type group, find entities that appear in similar contexts
        Object.entries(typeGroups).forEach(([type, entitiesOfType]) => {
            if (entitiesOfType.length < 2) return;
            
            // Special handling for people at same organization
            if (type === 'person') {
                entitiesOfType.forEach(person1 => {
                    entitiesOfType.forEach(person2 => {
                        if (person1.id >= person2.id) return;
                        
                        // Check if both mention same organization in description
                        const desc1 = (person1.description || '').toLowerCase();
                        const desc2 = (person2.description || '').toLowerCase();
                        
                        // Look for common organization names
                        const orgs = entities.filter(e => e.type === 'corporation' || e.type === 'organization');
                        orgs.forEach(org => {
                            const orgName = org.name.toLowerCase();
                            if (desc1.includes(orgName) && desc2.includes(orgName)) {
                                candidates.push({
                                    source: person1.id,
                                    sourceName: person1.name,
                                    target: person2.id,
                                    targetName: person2.name,
                                    confidence: 0.65,
                                    method: 'similar-context',
                                    evidence: `Both associated with ${org.name}`,
                                    context: org.name
                                });
                            }
                        });
                    });
                });
            }
        });
        
        console.log(`📝 Found ${candidates.length} similar context candidates`);
        return candidates;
    },

    /**
     * Aggregate and deduplicate candidates
     */
    _aggregateCandidates: function(candidates) {
        const map = new Map();
        
        candidates.forEach(candidate => {
            // Create bidirectional key (order doesn't matter)
            const key1 = `${candidate.source}-${candidate.target}`;
            const key2 = `${candidate.target}-${candidate.source}`;
            
            const key = map.has(key1) ? key1 : key2;
            
            if (map.has(key)) {
                // Aggregate: increase confidence, combine evidence
                const existing = map.get(key);
                existing.confidence = Math.min(existing.confidence + 0.1, 0.95);
                existing.methods = existing.methods || [existing.method];
                if (!existing.methods.includes(candidate.method)) {
                    existing.methods.push(candidate.method);
                }
                existing.evidence = Array.isArray(existing.evidence) 
                    ? [...existing.evidence, candidate.evidence]
                    : [existing.evidence, candidate.evidence];
            } else {
                map.set(key1, { ...candidate });
            }
        });
        
        return Array.from(map.values());
    },

    /**
     * Filter candidates by confidence threshold
     */
    filterByConfidence: function(candidates, minConfidence = 0.6) {
        return candidates.filter(c => c.confidence >= minConfidence);
    },

    /**
     * Remove candidates that already exist as relationships
     */
    removeExisting: function(candidates, existingRelationships) {
        const existingSet = new Set();
        
        existingRelationships.forEach(rel => {
            existingSet.add(`${rel.source}-${rel.target}`);
            existingSet.add(`${rel.target}-${rel.source}`);
        });
        
        return candidates.filter(candidate => {
            const key1 = `${candidate.source}-${candidate.target}`;
            const key2 = `${candidate.target}-${candidate.source}`;
            return !existingSet.has(key1) && !existingSet.has(key2);
        });
    },

    /**
     * Main function: analyze network and find all potential missing connections
     */
    analyzeMissingConnections: function(entities, relationships, documentText) {
        console.log('🔍 Starting comprehensive graph analysis...');
        console.log(`📊 Input: ${entities.length} entities, ${relationships.length} relationships`);
        
        const allCandidates = [];
        
        // Run all analysis methods
        if (documentText) {
            const coOccurrence = this.findCoOccurrences(entities, documentText);
            allCandidates.push(...coOccurrence);
            
            const similarContext = this.findSimilarContexts(entities, documentText);
            allCandidates.push(...similarContext);
        }
        
        const transitive = this.findTransitiveConnections(entities, relationships);
        allCandidates.push(...transitive);
        
        const shared = this.findSharedConnections(entities, relationships);
        allCandidates.push(...shared);
        
        // Aggregate all candidates
        const aggregated = this._aggregateCandidates(allCandidates);
        
        // Remove existing relationships
        const filtered = this.removeExisting(aggregated, relationships);
        
        // Sort by confidence (highest first)
        filtered.sort((a, b) => b.confidence - a.confidence);
        
        console.log(`✅ Graph analysis complete: ${filtered.length} potential missing connections found`);
        console.log(`📈 Confidence range: ${Math.min(...filtered.map(c => c.confidence)).toFixed(2)} - ${Math.max(...filtered.map(c => c.confidence)).toFixed(2)}`);
        
        return filtered;
    }
};

console.log('✅ graph-analysis.js loaded');
