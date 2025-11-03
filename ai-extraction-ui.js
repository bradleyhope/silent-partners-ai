/**
 * AI Extraction UI Components for Silent Partners
 * Handles the user interface for AI-powered network extraction
 */

(function() {
    'use strict';

    // State
    let extractionResults = null;
    let selectedEntities = new Set();
    let selectedRelationships = new Set();

    /**
     * Initialize AI extraction UI
     */
    function initAIExtractionUI() {
        console.log('[AI UI] Initializing AI extraction interface');
        
        // Find the sidebar (controls panel)
        const sidebar = document.querySelector('#controls') || document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('[AI UI] Sidebar not found');
            return;
        }

        // Create AI extraction section
        const aiSection = createAISection();
        
        // Insert before the "Add Entity" section
        const addEntitySection = Array.from(sidebar.children).find(el => 
            el.textContent.includes('Add Entity')
        );
        
        if (addEntitySection) {
            sidebar.insertBefore(aiSection, addEntitySection);
        } else {
            sidebar.appendChild(aiSection);
        }

        // Load saved API key
        loadApiKey();

        console.log('[AI UI] AI extraction interface initialized');
    }

    /**
     * Create the main AI extraction section
     */
    function createAISection() {
        const section = document.createElement('div');
        section.className = 'ai-extraction-section';
        section.innerHTML = `
            <h3>🤖 AI Network Extraction</h3>
            
            <div class="ai-config">
                <label for="ai-api-key">OpenAI API Key</label>
                <div class="api-key-input-group">
                    <input 
                        type="password" 
                        id="ai-api-key" 
                        placeholder="sk-..." 
                        autocomplete="off"
                    />
                    <button id="ai-save-key" class="btn-small" title="Save API key">💾</button>
                    <button id="ai-clear-key" class="btn-small" title="Clear API key">🗑️</button>
                </div>
                <small class="help-text">
                    Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI</a>. 
                    Stored locally in your browser.
                </small>
            </div>

            <div class="ai-input-section">
                <label for="ai-text-input">Paste text to extract network</label>
                <textarea 
                    id="ai-text-input" 
                    placeholder="Paste article, court document, or report here..."
                    rows="6"
                ></textarea>
                <div class="ai-text-stats">
                    <span id="ai-char-count">0 characters</span>
                </div>
            </div>

            <div class="ai-model-select">
                <label for="ai-model">Model</label>
                <select id="ai-model">
                    <option value="gpt-4.1-mini" selected>GPT-4.1 Mini (Fast, Cheap)</option>
                    <option value="gpt-4.1-nano">GPT-4.1 Nano (Fastest)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                </select>
            </div>

            <button id="ai-extract-btn" class="btn-primary">
                🔍 Extract Network
            </button>

            <div id="ai-status" class="ai-status" style="display: none;"></div>

            <div id="ai-results" class="ai-results" style="display: none;">
                <h4>Extraction Results</h4>
                
                <div class="results-section">
                    <div class="results-header">
                        <h5>✓ Entities <span id="entity-count">0</span></h5>
                        <div class="results-actions">
                            <button id="select-all-entities" class="btn-tiny">Select All</button>
                            <button id="deselect-all-entities" class="btn-tiny">Deselect All</button>
                        </div>
                    </div>
                    <div id="entities-list" class="results-list"></div>
                </div>

                <div class="results-section">
                    <div class="results-header">
                        <h5>✓ Relationships <span id="relationship-count">0</span></h5>
                        <div class="results-actions">
                            <button id="select-all-relationships" class="btn-tiny">Select All</button>
                            <button id="deselect-all-relationships" class="btn-tiny">Deselect All</button>
                        </div>
                    </div>
                    <div id="relationships-list" class="results-list"></div>
                </div>

                <button id="ai-add-to-network" class="btn-success">
                    ➕ Add Selected to Network
                </button>
            </div>
        `;

        // Attach event listeners
        attachEventListeners(section);

        return section;
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners(section) {
        // API key management
        section.querySelector('#ai-save-key').addEventListener('click', saveApiKey);
        section.querySelector('#ai-clear-key').addEventListener('click', clearApiKey);

        // Text input character count
        const textInput = section.querySelector('#ai-text-input');
        textInput.addEventListener('input', updateCharCount);

        // Extract button
        section.querySelector('#ai-extract-btn').addEventListener('click', performExtraction);

        // Results actions
        section.querySelector('#select-all-entities').addEventListener('click', () => selectAllEntities(true));
        section.querySelector('#deselect-all-entities').addEventListener('click', () => selectAllEntities(false));
        section.querySelector('#select-all-relationships').addEventListener('click', () => selectAllRelationships(true));
        section.querySelector('#deselect-all-relationships').addEventListener('click', () => selectAllRelationships(false));

        // Add to network button
        section.querySelector('#ai-add-to-network').addEventListener('click', addToNetwork);
    }

    /**
     * Load API key from storage
     */
    function loadApiKey() {
        const masked = window.silentPartners.aiExtraction.getApiKeyMasked();
        if (masked) {
            document.querySelector('#ai-api-key').value = masked;
            document.querySelector('#ai-api-key').disabled = true;
        }
    }

    /**
     * Save API key
     */
    function saveApiKey() {
        const input = document.querySelector('#ai-api-key');
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
        const input = document.querySelector('#ai-api-key');
        input.value = '';
        input.disabled = false;
        showStatus('API key cleared', 'success');
    }

    /**
     * Update character count
     */
    function updateCharCount() {
        const text = document.querySelector('#ai-text-input').value;
        const count = text.length;
        document.querySelector('#ai-char-count').textContent = `${count} characters`;
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        const statusDiv = document.querySelector('#ai-status');
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
        const text = document.querySelector('#ai-text-input').value.trim();
        const model = document.querySelector('#ai-model').value;

        if (!text) {
            showStatus('Please enter text to extract', 'error');
            return;
        }

        const state = window.silentPartners.aiExtraction.getState();
        if (!state.hasApiKey) {
            showStatus('Please configure your OpenAI API key first', 'error');
            return;
        }

        // Show loading state
        const extractBtn = document.querySelector('#ai-extract-btn');
        const originalText = extractBtn.textContent;
        extractBtn.disabled = true;
        extractBtn.textContent = '⏳ Extracting...';
        showStatus('Extracting network data from text...', 'info');

        // Hide previous results
        document.querySelector('#ai-results').style.display = 'none';

        try {
            const results = await window.silentPartners.aiExtraction.extractFromText(text, model);
            extractionResults = results;

            // Select all by default
            selectedEntities = new Set(results.entities.map((_, idx) => idx));
            selectedRelationships = new Set(results.relationships.map((_, idx) => idx));

            displayResults(results);
            showStatus(`Extracted ${results.entities.length} entities and ${results.relationships.length} relationships`, 'success');

        } catch (error) {
            console.error('[AI UI] Extraction error:', error);
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
        document.querySelector('#entity-count').textContent = results.entities.length;
        document.querySelector('#relationship-count').textContent = results.relationships.length;

        // Display entities
        const entitiesList = document.querySelector('#entities-list');
        entitiesList.innerHTML = results.entities.map((entity, idx) => `
            <div class="result-item">
                <label>
                    <input 
                        type="checkbox" 
                        class="entity-checkbox" 
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
        const relationshipsList = document.querySelector('#relationships-list');
        relationshipsList.innerHTML = results.relationships.map((rel, idx) => `
            <div class="result-item">
                <label>
                    <input 
                        type="checkbox" 
                        class="relationship-checkbox" 
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
        entitiesList.querySelectorAll('.entity-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (e.target.checked) {
                    selectedEntities.add(idx);
                } else {
                    selectedEntities.delete(idx);
                }
            });
        });

        relationshipsList.querySelectorAll('.relationship-checkbox').forEach(cb => {
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
        document.querySelector('#ai-results').style.display = 'block';
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
        document.querySelectorAll('.entity-checkbox').forEach(cb => {
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
        document.querySelectorAll('.relationship-checkbox').forEach(cb => {
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
        selectedEntities.forEach(idx => {
            const entity = extractionResults.entities[idx];
            window.silentPartners.visualizer.addEntity(
                entity.name,
                entity.type,
                entity.importance,
                entity.description || ''
            );
            addedEntities++;
        });

        // Add relationships
        selectedRelationships.forEach(idx => {
            const rel = extractionResults.relationships[idx];
            window.silentPartners.visualizer.addRelationship(
                rel.source,
                rel.target,
                rel.type,
                rel.value || '',
                rel.date || '',
                rel.status
            );
            addedRelationships++;
        });

        showStatus(`Added ${addedEntities} entities and ${addedRelationships} relationships to network`, 'success');

        // Clear results
        document.querySelector('#ai-results').style.display = 'none';
        document.querySelector('#ai-text-input').value = '';
        updateCharCount();
        extractionResults = null;
        selectedEntities.clear();
        selectedRelationships.clear();
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready with retry logic
    function tryInit(attempts = 0) {
        const sidebar = document.querySelector('#controls') || document.querySelector('.sidebar');
        if (sidebar) {
            initAIExtractionUI();
        } else if (attempts < 10) {
            console.log('[AI UI] Waiting for sidebar, attempt', attempts + 1);
            setTimeout(() => tryInit(attempts + 1), 200);
        } else {
            console.error('[AI UI] Failed to find sidebar after 10 attempts');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => tryInit());
    } else {
        tryInit();
    }

    console.log('[AI UI] Module loaded');

})();
