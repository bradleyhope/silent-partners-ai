/**
 * Integration between AI Extraction and Silent Partners Visualizer
 * Provides a clean API for adding extracted entities and relationships
 */

(function() {
    'use strict';

    // Wait for visualizer to be ready
    function waitForVisualizer(callback) {
        if (window.silentPartners && window.silentPartners.addNodeFromData) {
            callback();
        } else {
            setTimeout(() => waitForVisualizer(callback), 100);
        }
    }

    waitForVisualizer(() => {
        console.log('[AI Integration] Initializing visualizer integration');

        // Create visualizer API for AI extraction
        window.silentPartners.visualizer = {
            /**
             * Add entity to network
             * @param {string} name - Entity name
             * @param {string} type - Entity type (person, organization, location, event)
             * @param {number} importance - Importance (1-5)
             * @param {string} description - Description (not used in current visualizer, but stored)
             */
            addEntity: function(name, type, importance, description = '') {
                console.log('[AI Integration] Adding entity:', name, type, importance);

                // Check if entity already exists
                const exists = window.silentPartners.state.nodes.some(node => 
                    node.name.toLowerCase() === name.toLowerCase()
                );

                if (exists) {
                    console.log('[AI Integration] Entity already exists:', name);
                    return false;
                }

                // Map importance (1-5) to visualizer scale (0-1)
                const normalizedImportance = importance / 5;

                // Add node using existing API
                window.silentPartners.addNodeFromData({
                    name: name,
                    type: type,
                    importance: normalizedImportance,
                    description: description // Store for future use
                });

                return true;
            },

            /**
             * Add relationship to network
             * @param {string} sourceName - Source entity name
             * @param {string} targetName - Target entity name
             * @param {string} type - Relationship type
             * @param {string} value - Optional value (e.g., monetary amount)
             * @param {string} date - Optional date
             * @param {string} status - Status (confirmed, suspected, former)
             */
            addRelationship: function(sourceName, targetName, type, value = '', date = '', status = 'confirmed') {
                console.log('[AI Integration] Adding relationship:', sourceName, '→', targetName, type);

                // Find source and target nodes
                const sourceNode = window.silentPartners.state.nodes.find(node => 
                    node.name.toLowerCase() === sourceName.toLowerCase()
                );
                const targetNode = window.silentPartners.state.nodes.find(node => 
                    node.name.toLowerCase() === targetName.toLowerCase()
                );

                if (!sourceNode) {
                    console.warn('[AI Integration] Source entity not found:', sourceName);
                    return false;
                }

                if (!targetNode) {
                    console.warn('[AI Integration] Target entity not found:', targetName);
                    return false;
                }

                // Check if relationship already exists
                const exists = window.silentPartners.state.links.some(link => {
                    const linkSource = typeof link.source === 'object' ? link.source.id : link.source;
                    const linkTarget = typeof link.target === 'object' ? link.target.id : link.target;
                    return (linkSource === sourceNode.id && linkTarget === targetNode.id) ||
                           (linkSource === targetNode.id && linkTarget === sourceNode.id);
                });

                if (exists) {
                    console.log('[AI Integration] Relationship already exists');
                    return false;
                }

                // Create new link
                const newLink = {
                    source: sourceNode.id,
                    target: targetNode.id,
                    type: type,
                    status: status
                };

                if (date) {
                    newLink.date = date;
                }

                if (value) {
                    // Try to parse as number, otherwise store as string
                    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
                    if (!isNaN(numValue)) {
                        newLink.value = numValue;
                    } else {
                        newLink.valueLabel = value;
                    }
                }

                window.silentPartners.state.links.push(newLink);
                window.silentPartners.updateVisualization();

                return true;
            },

            /**
             * Get current network state
             */
            getState: function() {
                return {
                    nodeCount: window.silentPartners.state.nodes.length,
                    linkCount: window.silentPartners.state.links.length,
                    nodes: window.silentPartners.state.nodes,
                    links: window.silentPartners.state.links
                };
            },

            /**
             * Check if entity exists
             */
            entityExists: function(name) {
                return window.silentPartners.state.nodes.some(node => 
                    node.name.toLowerCase() === name.toLowerCase()
                );
            }
        };

        console.log('[AI Integration] Visualizer integration ready');
    });

})();
