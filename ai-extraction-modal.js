/**
 * AI Extraction Modal UI for Silent Partners
 * Modal-based interface that avoids sidebar integration issues
 */

(function() {
    'use strict';

    // State
    let extractionResults = null;
    let selectedEntities = new Set();
    let selectedRelationships = new Set();

    /**
     * Initialize AI extraction modal
     */
    function initAIExtractionModal() {
        console.log('[AI Modal] Initializing AI extraction modal');
        
        // Create modal HTML
        createModal();
        
        // Add toolbar button
        addToolbarButton();
        
        // Load saved API key
        loadApiKey();

        console.log('[AI Modal] AI extraction modal initialized');
    }

    /**
     * Add button to toolbar
     */
    function addToolbarButton() {
        // Find the header or create button container
        const header = document.querySelector('header') || document.querySelector('.header');
        
        if (!header) {
            console.warn('[AI Modal] No header found, creating floating button');
            createFloatingButton();
            return;
        }

        // Create AI button
        const aiButton = document.createElement('button');
        aiButton.id = 'ai-extract-button';
        aiButton.className = 'ai-toolbar-button';
        aiButton.innerHTML = '🤖 AI Extract';
        aiButton.title = 'Extract network from text using AI';
        aiButton.addEventListener('click', openModal);

        // Insert button in header
        header.appendChild(aiButton);
    }

    /**
     * Create floating button if no header exists
     */
    function createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'ai-extract-button';
        button.className = 'ai-floating-button';
        button.innerHTML = '🤖';
        button.title = 'AI Extract';
        button.addEventListener('click', openModal);
        document.body.appendChild(button);
    }

    /**
     * Create modal structure
     */
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'ai-extraction-modal';
        modal.className = 'ai-modal';
        modal.innerHTML = `
            <div class="ai-modal-overlay"></div>
            <div class="ai-modal-content">
                <div class="ai-modal-header">
                    <h2>🤖 AI Network Extraction</h2>
                    <button class="ai-modal-close" title="Close">&times;</button>
                </div>
                
                <div class="ai-modal-body">
                    <div class="ai-config">
                        <p class="help-text">
                            <strong>🔐 Server-Side Processing:</strong> AI extraction uses your backend API with a secure server-side OpenAI key. No client-side API key needed!
                        </p>
                    </div>

                    <div class="ai-input-section">
                        <label for="ai-text-input-modal">Paste text to extract network</label>
                        <textarea 
                            id="ai-text-input-modal" 
                            placeholder="Paste article, court document, or report here..."
                            rows="8"
                        ></textarea>
                        <div class="ai-text-stats">
                            <span id="ai-char-count-modal">0 characters</span>
                        </div>
                    </div>

                    <div class="ai-model-select">
                        <label for="ai-model-modal">Model</label>
                        <select id="ai-model-modal">
                            <option value="gpt-5-nano">GPT-5 Nano (Fast & Affordable)</option>
                            <option value="gpt-5">GPT-5 (Premium - Balanced)</option>
                            <option value="gpt-5-thinking">GPT-5 Thinking (Premium - Advanced Reasoning)</option>
                        </select>
                    </div>

                    <button id="ai-extract-btn-modal" class="btn-primary">
                        🔍 Extract Network
                    </button>

                    <div id="ai-status-modal" class="ai-status" style="display: none;"></div>

                    <div id="ai-results-modal" class="ai-results" style="display: none;">
                        <h4>Extraction Results</h4>
                        
                        <div class="results-section">
                            <div class="results-header">
                                <h5>✓ Entities <span id="entity-count-modal">0</span></h5>
                                <div class="results-actions">
                                    <button id="select-all-entities-modal" class="btn-tiny">Select All</button>
                                    <button id="deselect-all-entities-modal" class="btn-tiny">Deselect All</button>
                                </div>
                            </div>
                            <div id="entities-list-modal" class="results-list"></div>
                        </div>

                        <div class="results-section">
                            <div class="results-header">
                                <h5>✓ Relationships <span id="relationship-count-modal">0</span></h5>
                                <div class="results-actions">
                                    <button id="select-all-relationships-modal" class="btn-tiny">Select All</button>
                                    <button id="deselect-all-relationships-modal" class="btn-tiny">Deselect All</button>
                                </div>
                            </div>
                            <div id="relationships-list-modal" class="results-list"></div>
                        </div>

                        <button id="ai-add-to-network-modal" class="btn-success">
                            ➕ Add Selected to Network
                        </button>
                    </div>

                    <div id="ai-inference-section-modal" class="ai-inference-section" style="display: none;">
                        <div class="inference-header">
                            <h4>🔗 Find Missing Connections</h4>
                            <p class="help-text">
                                Use AI reasoning to find implicit relationships between entities.
                                This finds connections that weren't explicitly stated in the text.
                            </p>
                        </div>

                        <div class="inference-options">
                            <label>
                                <input type="checkbox" id="ai-inference-enabled-modal" checked />
                                Enable relationship inference
                            </label>
                            <div class="inference-stats">
                                <small>Cost: ~$0.005 extra | Time: ~15 seconds</small>
                            </div>
                        </div>

                        <button id="ai-infer-btn-modal" class="btn-primary">
                            🔍 Find Missing Connections
                        </button>

                        <div id="ai-inference-status-modal" class="ai-status" style="display: none;"></div>

                        <div id="ai-inference-results-modal" class="ai-results" style="display: none;">
                            <h5>✓ New Connections Found <span id="inference-count-modal">0</span></h5>
                            <div id="inference-list-modal" class="results-list"></div>
                            <button id="ai-add-inferred-modal" class="btn-success">
                                ➕ Add Inferred Connections
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach event listeners
        attachEventListeners(modal);
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners(modal) {
        // Close modal
        modal.querySelector('.ai-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.ai-modal-overlay').addEventListener('click', closeModal);

        // Text input character count
        const textInput = modal.querySelector('#ai-text-input-modal');
        textInput.addEventListener('input', updateCharCount);

        // Extract button
        modal.querySelector('#ai-extract-btn-modal').addEventListener('click', performExtraction);

        // Results actions
        modal.querySelector('#select-all-entities-modal').addEventListener('click', () => selectAllEntities(true));
        modal.querySelector('#deselect-all-entities-modal').addEventListener('click', () => selectAllEntities(false));
        modal.querySelector('#select-all-relationships-modal').addEventListener('click', () => selectAllRelationships(true));
        modal.querySelector('#deselect-all-relationships-modal').addEventListener('click', () => selectAllRelationships(false));

        // Add to network button
        modal.querySelector('#ai-add-to-network-modal').addEventListener('click', addToNetwork);

        // Inference buttons
        modal.querySelector('#ai-infer-btn-modal').addEventListener('click', performInference);
        modal.querySelector('#ai-add-inferred-modal').addEventListener('click', addInferredToNetwork);

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }

    /**
     * Open modal
     */
    function openModal() {
        const modal = document.getElementById('ai-extraction-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    /**
     * Close modal
     */
    function closeModal() {
        const modal = document.getElementById('ai-extraction-modal');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Load API key from storage
     */
    function loadApiKey() {
        const masked = window.silentPartners.aiExtraction.getApiKeyMasked();
        if (masked) {
            document.querySelector('#ai-api-key-modal').value = masked;
            document.querySelector('#ai-api-key-modal').disabled = true;
        }
    }

    /**
     * Save API key
     */
    function saveApiKey() {
        const input = document.querySelector('#ai-api-key-modal');
        const key = input.value.trim();

        if (!key) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        if (!key.startsWith('sk-')) {
            showStatus('Invalid API key format (should start with sk-)', 'error');
            return;
        }

        window.silentPartners.aiExtraction.setApiKey(key);
        input.value = window.silentPartners.aiExtraction.getApiKeyMasked();
        input.disabled = true;
        showStatus('API key saved', 'success');
    }

    /**
     * Clear API key
     */
    function clearApiKey() {
        if (!confirm('Clear saved API key?')) return;

        window.silentPartners.aiExtraction.clearApiKey();
        const input = document.querySelector('#ai-api-key-modal');
        input.value = '';
        input.disabled = false;
        showStatus('API key cleared', 'success');
    }

    /**
     * Update character count
     */
    function updateCharCount() {
        const text = document.querySelector('#ai-text-input-modal').value;
        const count = text.length;
        document.querySelector('#ai-char-count-modal').textContent = `${count} characters`;
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        const statusDiv = document.querySelector('#ai-status-modal');
        statusDiv.textContent = message;
        statusDiv.className = `ai-status ai-status-${type}`;
        statusDiv.style.display = 'block';

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Perform extraction
     */
    async function performExtraction() {
        const text = document.querySelector('#ai-text-input-modal').value.trim();
        const model = document.querySelector('#ai-model-modal').value;

        if (!text) {
            showStatus('Please enter text to extract', 'error');
            return;
        }

        // Show loading state
        const extractBtn = document.querySelector('#ai-extract-btn-modal');
        const originalText = extractBtn.textContent;
        extractBtn.disabled = true;
        extractBtn.textContent = '⏳ Extracting...';
        showStatus('Extracting network data from text...', 'info');

        // Hide previous results
        document.querySelector('#ai-results-modal').style.display = 'none';

        try {
            // Use backend API instead of client-side extraction
            const results = await window.silentPartners.aiBackend.extractNetwork(text, model);
            extractionResults = results;

            // Select all by default
            selectedEntities = new Set(results.entities.map((_, idx) => idx));
            selectedRelationships = new Set(results.relationships.map((_, idx) => idx));

            displayResults(results);
            showStatus(`Extracted ${results.entities.length} entities and ${results.relationships.length} relationships`, 'success');

        } catch (error) {
            console.error('[AI Modal] Extraction error:', error);
            showStatus(`Extraction failed: ${error.message}`, 'error');
        } finally {
            extractBtn.disabled = false;
            extractBtn.textContent = originalText;
        }
    }

    /**
     * Display extraction results
     */
    function displayResults(results) {
        // Update counts
        document.querySelector('#entity-count-modal').textContent = results.entities.length;
        document.querySelector('#relationship-count-modal').textContent = results.relationships.length;

        // Display entities
        const entitiesList = document.querySelector('#entities-list-modal');
        entitiesList.innerHTML = results.entities.map((entity, idx) => `
            <div class="result-item">
                <label>
                    <input 
                        type="checkbox" 
                        class="entity-checkbox-modal" 
                        data-index="${idx}" 
                        ${selectedEntities.has(idx) ? 'checked' : ''}
                    />
                    <span class="entity-name">${escapeHtml(entity.name)}</span>
                    <span class="entity-type">${entity.type}</span>
                    <span class="entity-importance">${'⭐'.repeat(entity.importance)}</span>
                </label>
                ${entity.description ? `<p class="entity-description">${escapeHtml(entity.description)}</p>` : ''}
            </div>
        `).join('');

        // Display relationships
        const relationshipsList = document.querySelector('#relationships-list-modal');
        relationshipsList.innerHTML = results.relationships.map((rel, idx) => `
            <div class="result-item">
                <label>
                    <input 
                        type="checkbox" 
                        class="relationship-checkbox-modal" 
                        data-index="${idx}" 
                        ${selectedRelationships.has(idx) ? 'checked' : ''}
                    />
                    <span class="rel-source">${escapeHtml(rel.source)}</span>
                    <span class="rel-arrow">→</span>
                    <span class="rel-target">${escapeHtml(rel.target)}</span>
                </label>
                <p class="rel-details">
                    <span class="rel-type">${rel.type}</span>
                    ${rel.status !== 'confirmed' ? `<span class="rel-status">${rel.status}</span>` : ''}
                    ${rel.value ? `<span class="rel-value">${escapeHtml(rel.value)}</span>` : ''}
                </p>
                ${rel.description ? `<p class="rel-description">${escapeHtml(rel.description)}</p>` : ''}
            </div>
        `).join('');

        // Attach checkbox listeners
        entitiesList.querySelectorAll('.entity-checkbox-modal').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (e.target.checked) {
                    selectedEntities.add(idx);
                } else {
                    selectedEntities.delete(idx);
                }
            });
        });

        relationshipsList.querySelectorAll('.relationship-checkbox-modal').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (e.target.checked) {
                    selectedRelationships.add(idx);
                } else {
                    selectedRelationships.delete(idx);
                }
            });
        });

        // Show results
        document.querySelector('#ai-results-modal').style.display = 'block';
        
        // Show inference section
        document.querySelector('#ai-inference-section-modal').style.display = 'block';
    }

    /**
     * Select/deselect all entities
     */
    function selectAllEntities(select) {
        if (select) {
            selectedEntities = new Set(extractionResults.entities.map((_, idx) => idx));
        } else {
            selectedEntities.clear();
        }
        document.querySelectorAll('.entity-checkbox-modal').forEach(cb => {
            cb.checked = select;
        });
    }

    /**
     * Select/deselect all relationships
     */
    function selectAllRelationships(select) {
        if (select) {
            selectedRelationships = new Set(extractionResults.relationships.map((_, idx) => idx));
        } else {
            selectedRelationships.clear();
        }
        document.querySelectorAll('.relationship-checkbox-modal').forEach(cb => {
            cb.checked = select;
        });
    }

    /**
     * Add selected items to network
     */
    function addToNetwork() {
        if (!extractionResults) return;

        if (selectedEntities.size === 0 && selectedRelationships.size === 0) {
            showStatus('Please select at least one entity or relationship', 'error');
            return;
        }

        // Get the visualizer instance
        if (!window.silentPartners.visualizer) {
            showStatus('Visualizer not initialized', 'error');
            return;
        }

        let addedEntities = 0;
        let addedRelationships = 0;

        // Add entities
        const entityIdMap = {}; // Map AI IDs to visualizer IDs
        selectedEntities.forEach(idx => {
            const entity = extractionResults.entities[idx];
            const nodeData = {
                name: entity.name,
                type: entity.type || 'person',
                importance: entity.importance || 0.5,
                description: entity.description || ''
            };
            const visualizerNode = window.silentPartners.addNodeFromData(nodeData);
            entityIdMap[entity.id] = visualizerNode.id;
            addedEntities++;
        });

        // Add relationships
        selectedRelationships.forEach(idx => {
            const rel = extractionResults.relationships[idx];
            const linkData = {
                source: entityIdMap[rel.source] || rel.source,
                target: entityIdMap[rel.target] || rel.target,
                type: rel.type || '',
                value: rel.value || '',
                status: rel.status || 'confirmed'
            };
            if (rel.date) linkData.date = rel.date;
            window.silentPartners.addLinkFromData(linkData);
            addedRelationships++;
        });

        // Update visualization
        window.silentPartners.updateVisualization();
        
        showStatus(`Added ${addedEntities} entities and ${addedRelationships} relationships to network`, 'success');

        // Close modal after successful add
        setTimeout(() => {
            closeModal();
            // Clear results
            document.querySelector('#ai-results-modal').style.display = 'none';
            document.querySelector('#ai-text-input-modal').value = '';
            updateCharCount();
            extractionResults = null;
            selectedEntities.clear();
            selectedRelationships.clear();
        }, 1500);
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Perform relationship inference
     */
    async function performInference() {
        console.log('[AI Modal] Starting relationship inference...');
        
        if (!extractionResults || !extractionResults.entities) {
            showInferenceStatus('Please extract entities first', 'error');
            return;
        }

        const textInput = document.querySelector('#ai-text-input-modal').value;
        const model = document.querySelector('#ai-model-modal').value;

        try {
            showInferenceStatus('Analyzing network for missing connections...', 'loading');
            
            // Get current entities and relationships
            const entities = extractionResults.entities;
            const relationships = extractionResults.relationships;

            // Use backend API for inference
            const result = await window.silentPartners.aiBackend.inferRelationships(
                entities,
                relationships,
                textInput,
                model
            );

            // Format result to match expected structure
            const formattedResult = {
                success: true,
                newRelationships: result.inferred_relationships || [],
                relationshipsAdded: (result.inferred_relationships || []).length,
                candidatesAnalyzed: (result.inferred_relationships || []).length,
                inferredDetails: (result.inferred_relationships || []).map(r => ({
                    source: r.source,
                    target: r.target,
                    type: r.type,
                    exists: true,
                    confidence: Math.round((r.confidence || 0.7) * 100),
                    reasoning: r.description,
                    evidence: r.evidence
                }))
            };

            if (!formattedResult.success) {
                showInferenceStatus(`Inference failed: ${formattedResult.error}`, 'error');
                return;
            }

            // Display results
            displayInferenceResults(formattedResult);
            showInferenceStatus(
                `Found ${formattedResult.relationshipsAdded} new connections (analyzed ${formattedResult.candidatesAnalyzed} candidates)`,
                'success'
            );

        } catch (error) {
            console.error('[AI Modal] Inference error:', error);
            showInferenceStatus(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * Display inference results
     */
    function displayInferenceResults(result) {
        const resultsDiv = document.querySelector('#ai-inference-results-modal');
        const listDiv = document.querySelector('#inference-list-modal');
        const countSpan = document.querySelector('#inference-count-modal');

        // Store results
        extractionResults.inferredRelationships = result.newRelationships;
        extractionResults.inferenceDetails = result;

        // Update count
        countSpan.textContent = result.relationshipsAdded;

        // Clear and populate list
        listDiv.innerHTML = '';

        result.inferredDetails.forEach((rel, index) => {
            if (!rel.exists) return;

            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <div class="result-item-header">
                    <strong>${escapeHtml(rel.source)} ↔ ${escapeHtml(rel.target)}</strong>
                    <span class="badge">${escapeHtml(rel.type || 'association')}</span>
                    <span class="confidence">${rel.confidence}%</span>
                </div>
                <div class="result-item-body">
                    <small><strong>Reasoning:</strong> ${escapeHtml(rel.reasoning || '')}</small>
                    <small><strong>Evidence:</strong> ${escapeHtml(rel.evidence || '')}</small>
                </div>
            `;
            listDiv.appendChild(item);
        });

        // Show results
        resultsDiv.style.display = 'block';
    }

    /**
     * Add inferred relationships to network
     */
    function addInferredToNetwork() {
        if (!extractionResults?.inferredRelationships) {
            showInferenceStatus('No inferred relationships to add', 'error');
            return;
        }

        const relationships = extractionResults.inferredRelationships;
        
        console.log(`[AI Modal] Adding ${relationships.length} inferred relationships to network`);

        // Add each relationship
        relationships.forEach(rel => {
            window.silentPartners.visualizer.addRelationship(
                rel.source,
                rel.target,
                rel.type,
                rel.description,
                rel.status || 'inferred'
            );
        });

        showInferenceStatus(`Added ${relationships.length} inferred relationships to network!`, 'success');
        
        // Update visualization
        if (window.silentPartners.visualizer.update) {
            window.silentPartners.visualizer.update();
        }
    }

    /**
     * Show inference status message
     */
    function showInferenceStatus(message, type = 'info') {
        const statusDiv = document.querySelector('#ai-inference-status-modal');
        statusDiv.textContent = message;
        statusDiv.className = `ai-status ai-status-${type}`;
        statusDiv.style.display = 'block';

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Initialize when DOM is ready
    function tryInit(attempts = 0) {
        if (window.silentPartners?.aiExtraction && window.silentPartners?.visualizer) {
            initAIExtractionModal();
        } else if (attempts < 20) {
            setTimeout(() => tryInit(attempts + 1), 200);
        } else {
            console.error('[AI Modal] Failed to initialize - dependencies not loaded');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => tryInit());
    } else {
        tryInit();
    }

    console.log('[AI Modal] Module loaded');

})();
