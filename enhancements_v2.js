/**
 * Silent Partners - Enhanced Features V2
 * Adds: Themes, Analytics, Export, Undo/Redo, Search, Layouts, Theme Builder
 */

(function() {
    'use strict';
    
    console.log('🎨 Loading Silent Partners Enhanced V2...');
    
    // ======================
    // GLOBAL STATE
    // ======================
    
    let historyStack = [];
    let historyIndex = -1;
    const MAX_HISTORY = 50;
    
    // ======================
    // UNDO/REDO SYSTEM
    // ======================
    
    function saveState() {
        if (!window.nodes || !window.links) return;
        
        // Remove any states after current index
        historyStack = historyStack.slice(0, historyIndex + 1);
        
        // Save current state
        const state = {
            nodes: JSON.parse(JSON.stringify(window.nodes)),
            links: JSON.parse(JSON.stringify(window.links))
        };
        
        historyStack.push(state);
        
        // Limit history size
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        } else {
            historyIndex++;
        }
        
        updateUndoRedoButtons();
    }
    
    function undo() {
        if (historyIndex <= 0) return;
        
        historyIndex--;
        restoreState(historyStack[historyIndex]);
        updateUndoRedoButtons();
    }
    
    function redo() {
        if (historyIndex >= historyStack.length - 1) return;
        
        historyIndex++;
        restoreState(historyStack[historyIndex]);
        updateUndoRedoButtons();
    }
    
    function restoreState(state) {
        window.nodes = JSON.parse(JSON.stringify(state.nodes));
        window.links = JSON.parse(JSON.stringify(state.links));
        
        if (window.updateVisualization) {
            window.updateVisualization();
        }
    }
    
    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = historyIndex <= 0;
            undoBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = historyIndex >= historyStack.length - 1;
            redoBtn.style.opacity = historyIndex >= historyStack.length - 1 ? '0.5' : '1';
        }
    }
    
    // ======================
    // SEARCH & HIGHLIGHT
    // ======================
    
    let highlightedNodes = [];
    
    function searchEntities(query) {
        if (!window.nodes || !query) {
            clearHighlight();
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        highlightedNodes = window.nodes.filter(node => 
            node.name.toLowerCase().includes(lowerQuery) ||
            (node.type && node.type.toLowerCase().includes(lowerQuery))
        );
        
        if (highlightedNodes.length > 0) {
            highlightNodes(highlightedNodes);
            
            // Zoom to first result
            if (window.simulation && highlightedNodes[0]) {
                zoomToNode(highlightedNodes[0]);
            }
        }
        
        return highlightedNodes.length;
    }
    
    function highlightNodes(nodes) {
        if (!window.svg) return;
        
        // Dim all nodes
        window.svg.selectAll('.node')
            .style('opacity', 0.2);
        
        window.svg.selectAll('.link')
            .style('opacity', 0.1);
        
        // Highlight matching nodes
        nodes.forEach(node => {
            window.svg.selectAll('.node')
                .filter(d => d.id === node.id)
                .style('opacity', 1)
                .style('stroke', '#FF6B6B')
                .style('stroke-width', 3);
        });
    }
    
    function clearHighlight() {
        if (!window.svg) return;
        
        window.svg.selectAll('.node')
            .style('opacity', 1)
            .style('stroke', null)
            .style('stroke-width', null);
        
        window.svg.selectAll('.link')
            .style('opacity', 1);
        
        highlightedNodes = [];
    }
    
    function zoomToNode(node) {
        if (!window.svg || !node.x || !node.y) return;
        
        const svg = d3.select('#canvas');
        const width = parseInt(svg.style('width'));
        const height = parseInt(svg.style('height'));
        
        const scale = 1.5;
        const x = -node.x * scale + width / 2;
        const y = -node.y * scale + height / 2;
        
        svg.select('g')
            .transition()
            .duration(750)
            .attr('transform', `translate(${x},${y}) scale(${scale})`);
    }
    
    // ======================
    // LAYOUT ALGORITHMS
    // ======================
    
    function applyCircularLayout() {
        if (!window.nodes) return;
        
        const radius = 300;
        const angleStep = (2 * Math.PI) / window.nodes.length;
        
        window.nodes.forEach((node, i) => {
            const angle = i * angleStep;
            node.x = Math.cos(angle) * radius;
            node.y = Math.sin(angle) * radius;
        });
        
        if (window.simulation) {
            window.simulation.alpha(0.3).restart();
        }
    }
    
    function applyRadialLayout() {
        if (!window.nodes || !window.links) return;
        
        // Find most connected node as center
        const degrees = {};
        window.nodes.forEach(n => degrees[n.id] = 0);
        window.links.forEach(l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            degrees[sourceId]++;
            degrees[targetId]++;
        });
        
        const centerNode = window.nodes.reduce((max, node) => 
            degrees[node.id] > degrees[max.id] ? node : max
        );
        
        // Place center node
        centerNode.x = 0;
        centerNode.y = 0;
        
        // Place connected nodes in rings
        const rings = [[], [], []];
        window.nodes.forEach(node => {
            if (node.id === centerNode.id) return;
            
            const distance = degrees[node.id];
            if (distance > 5) rings[0].push(node);
            else if (distance > 2) rings[1].push(node);
            else rings[2].push(node);
        });
        
        rings.forEach((ring, ringIndex) => {
            const radius = (ringIndex + 1) * 150;
            const angleStep = (2 * Math.PI) / ring.length;
            
            ring.forEach((node, i) => {
                const angle = i * angleStep;
                node.x = Math.cos(angle) * radius;
                node.y = Math.sin(angle) * radius;
            });
        });
        
        if (window.simulation) {
            window.simulation.alpha(0.3).restart();
        }
    }
    
    function applyHierarchicalLayout() {
        if (!window.nodes || !window.links) return;
        
        // Build hierarchy based on connections
        const levels = {};
        const visited = new Set();
        
        // Find root (most connected)
        const degrees = {};
        window.nodes.forEach(n => degrees[n.id] = 0);
        window.links.forEach(l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            degrees[sourceId]++;
            degrees[targetId]++;
        });
        
        const root = window.nodes.reduce((max, node) => 
            degrees[node.id] > degrees[max.id] ? node : max
        );
        
        // BFS to assign levels
        const queue = [[root, 0]];
        visited.add(root.id);
        
        while (queue.length > 0) {
            const [node, level] = queue.shift();
            if (!levels[level]) levels[level] = [];
            levels[level].push(node);
            
            // Find connected nodes
            window.links.forEach(link => {
                const sourceId = link.source.id || link.source;
                const targetId = link.target.id || link.target;
                
                let nextNode = null;
                if (sourceId === node.id && !visited.has(targetId)) {
                    nextNode = window.nodes.find(n => n.id === targetId);
                } else if (targetId === node.id && !visited.has(sourceId)) {
                    nextNode = window.nodes.find(n => n.id === sourceId);
                }
                
                if (nextNode) {
                    visited.add(nextNode.id);
                    queue.push([nextNode, level + 1]);
                }
            });
        }
        
        // Position nodes
        Object.keys(levels).forEach(level => {
            const nodes = levels[level];
            const y = parseInt(level) * 150 - 200;
            const xStep = 800 / (nodes.length + 1);
            
            nodes.forEach((node, i) => {
                node.x = (i + 1) * xStep - 400;
                node.y = y;
            });
        });
        
        if (window.simulation) {
            window.simulation.alpha(0.3).restart();
        }
    }
    
    function applyTimelineLayout() {
        if (!window.nodes) return;
        
        // Sort by date if available
        const nodesWithDates = window.nodes.filter(n => n.date);
        const nodesWithoutDates = window.nodes.filter(n => !n.date);
        
        if (nodesWithDates.length === 0) {
            alert('No dates found in entities. Add dates to use timeline layout.');
            return;
        }
        
        nodesWithDates.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const xStep = 800 / (nodesWithDates.length + 1);
        nodesWithDates.forEach((node, i) => {
            node.x = (i + 1) * xStep - 400;
            node.y = 0;
        });
        
        // Place nodes without dates at bottom
        const xStep2 = 800 / (nodesWithoutDates.length + 1);
        nodesWithoutDates.forEach((node, i) => {
            node.x = (i + 1) * xStep2 - 400;
            node.y = 200;
        });
        
        if (window.simulation) {
            window.simulation.alpha(0.3).restart();
        }
    }
    
    // ======================
    // THEME SYSTEM
    // ======================
    
    const THEMES = {
        lombardi: {
            name: 'Lombardi Classic',
            background: '#F5F2ED',
            text: '#2A2A2A',
            line: '#2A2A2A',
            node: '#2A2A2A',
            nodeFill: '#F5F2ED',
            sidebar: '#FFFFFF',
            accent: '#8B7355'
        },
        clean: {
            name: 'Clean Minimal',
            background: '#FFFFFF',
            text: '#000000',
            line: '#333333',
            node: '#000000',
            nodeFill: '#FFFFFF',
            sidebar: '#F8F8F8',
            accent: '#666666'
        },
        dark: {
            name: 'Dark Mode',
            background: '#1A1A1A',
            text: '#E0E0E0',
            line: '#CCCCCC',
            node: '#FFFFFF',
            nodeFill: '#2A2A2A',
            sidebar: '#252525',
            accent: '#4A9EFF'
        },
        corporate: {
            name: 'Corporate',
            background: '#F0F4F8',
            text: '#1E3A5F',
            line: '#2C5F8D',
            node: '#1E3A5F',
            nodeFill: '#FFFFFF',
            sidebar: '#FFFFFF',
            accent: '#3B82F6'
        },
        vibrant: {
            name: 'Vibrant',
            background: '#FFF9E6',
            text: '#2C1810',
            line: '#E63946',
            node: '#457B9D',
            nodeFill: '#F1FAEE',
            sidebar: '#FFFFFF',
            accent: '#F77F00'
        },
        custom: {
            name: 'Custom',
            background: '#F5F2ED',
            text: '#2A2A2A',
            line: '#2A2A2A',
            node: '#2A2A2A',
            nodeFill: '#F5F2ED',
            sidebar: '#FFFFFF',
            accent: '#8B7355'
        }
    };
    
    let currentTheme = 'lombardi';
    
    function applyTheme(themeName) {
        const theme = THEMES[themeName];
        if (!theme) return;
        
        currentTheme = themeName;
        
        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.text;
        
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.backgroundColor = theme.sidebar;
            controls.style.color = theme.text;
        }
        
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.style.backgroundColor = theme.background;
        }
        
        document.documentElement.style.setProperty('--bg-color', theme.background);
        document.documentElement.style.setProperty('--text-color', theme.text);
        document.documentElement.style.setProperty('--line-color', theme.line);
        document.documentElement.style.setProperty('--node-color', theme.node);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        
        // Update graph visualization colors
        if (window.svg) {
            // Update link colors
            window.svg.selectAll('.link')
                .attr('stroke', theme.line);
            
            // Update node colors
            window.svg.selectAll('.node')
                .attr('stroke', theme.node)
                .attr('fill', theme.nodeFill);
            
            // Update text colors
            window.svg.selectAll('text')
                .attr('fill', theme.text);
        }
        
        if (window.updateVisualization) {
            window.updateVisualization();
        }
        
        console.log(`🎨 Applied theme: ${theme.name}`);
    }
    
    // ======================
    // CUSTOM THEME BUILDER
    // ======================
    
    function showThemeBuilder() {
        const theme = THEMES[currentTheme];
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 30px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        content.innerHTML = `
            <h2>Custom Theme Builder</h2>
            <p>Customize colors to match your brand</p>
            
            <div style="margin: 20px 0;">
                <label style="display: block; margin: 10px 0;">
                    <strong>Background:</strong>
                    <input type="color" id="theme-bg" value="${theme.background}" style="margin-left: 10px;">
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <strong>Text:</strong>
                    <input type="color" id="theme-text" value="${theme.text}" style="margin-left: 10px;">
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <strong>Lines:</strong>
                    <input type="color" id="theme-line" value="${theme.line}" style="margin-left: 10px;">
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <strong>Nodes:</strong>
                    <input type="color" id="theme-node" value="${theme.node}" style="margin-left: 10px;">
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <strong>Node Fill:</strong>
                    <input type="color" id="theme-nodefill" value="${theme.nodeFill}" style="margin-left: 10px;">
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <strong>Sidebar:</strong>
                    <input type="color" id="theme-sidebar" value="${theme.sidebar}" style="margin-left: 10px;">
                </label>
                
                <label style="display: block; margin: 10px 0;">
                    <strong>Accent:</strong>
                    <input type="color" id="theme-accent" value="${theme.accent}" style="margin-left: 10px;">
                </label>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="apply-custom-theme" style="flex: 1; padding: 10px; background: #4A9EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Apply Theme
                </button>
                <button id="save-custom-theme" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Save Theme
                </button>
                <button id="close-theme-builder" style="padding: 10px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Live preview
        const colorInputs = content.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('input', () => {
                THEMES.custom = {
                    name: 'Custom',
                    background: document.getElementById('theme-bg').value,
                    text: document.getElementById('theme-text').value,
                    line: document.getElementById('theme-line').value,
                    node: document.getElementById('theme-node').value,
                    nodeFill: document.getElementById('theme-nodefill').value,
                    sidebar: document.getElementById('theme-sidebar').value,
                    accent: document.getElementById('theme-accent').value
                };
                applyTheme('custom');
            });
        });
        
        document.getElementById('apply-custom-theme').onclick = () => {
            THEMES.custom = {
                name: 'Custom',
                background: document.getElementById('theme-bg').value,
                text: document.getElementById('theme-text').value,
                line: document.getElementById('theme-line').value,
                node: document.getElementById('theme-node').value,
                nodeFill: document.getElementById('theme-nodefill').value,
                sidebar: document.getElementById('theme-sidebar').value,
                accent: document.getElementById('theme-accent').value
            };
            applyTheme('custom');
            
            // Update theme selector
            const selector = document.getElementById('theme-selector');
            if (selector) {
                selector.value = 'custom';
            }
        };
        
        document.getElementById('save-custom-theme').onclick = () => {
            const themeName = prompt('Enter a name for this theme:');
            if (themeName) {
                const customTheme = {
                    name: themeName,
                    background: document.getElementById('theme-bg').value,
                    text: document.getElementById('theme-text').value,
                    line: document.getElementById('theme-line').value,
                    node: document.getElementById('theme-node').value,
                    nodeFill: document.getElementById('theme-nodefill').value,
                    sidebar: document.getElementById('theme-sidebar').value,
                    accent: document.getElementById('theme-accent').value
                };
                
                localStorage.setItem(`theme_${themeName}`, JSON.stringify(customTheme));
                alert(`Theme "${themeName}" saved!`);
            }
        };
        
        document.getElementById('close-theme-builder').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        };
    }
    
    // ======================
    // ENHANCED EXPORT
    // ======================
    
    function exportHighResPNG(scale = 2) {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        
        const svg = canvas.querySelector('svg');
        if (!svg) return;
        
        const bbox = svg.getBBox();
        const width = bbox.width + 100;
        const height = bbox.height + 100;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width * scale;
        tempCanvas.height = height * scale;
        const ctx = tempCanvas.getContext('2d');
        
        ctx.scale(scale, scale);
        ctx.fillStyle = THEMES[currentTheme].background;
        ctx.fillRect(0, 0, width, height);
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const blob = new Blob([svgData], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        
        img.onload = () => {
            ctx.drawImage(img, 50, 50);
            
            tempCanvas.toBlob(blob => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `network_${scale}x.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        };
        
        img.src = url;
    }
    
    function exportSVG() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        
        const svg = canvas.querySelector('svg');
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'network.svg';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    function showExportModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 30px;
            max-width: 400px;
        `;
        
        content.innerHTML = `
            <h2>Enhanced Export</h2>
            <p>Choose export format and quality</p>
            
            <div style="margin: 20px 0;">
                <button id="export-png-1x" style="display: block; width: 100%; padding: 12px; margin: 8px 0; background: #4A9EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    PNG - Standard (1x)
                </button>
                <button id="export-png-2x" style="display: block; width: 100%; padding: 12px; margin: 8px 0; background: #4A9EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    PNG - High-Res (2x)
                </button>
                <button id="export-png-4x" style="display: block; width: 100%; padding: 12px; margin: 8px 0; background: #4A9EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    PNG - Ultra-Res (4x)
                </button>
                <button id="export-svg-btn" style="display: block; width: 100%; padding: 12px; margin: 8px 0; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    SVG - Vector (Infinite Zoom)
                </button>
            </div>
            
            <button id="close-export" style="width: 100%; padding: 10px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                Close
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        document.getElementById('export-png-1x').onclick = () => exportHighResPNG(1);
        document.getElementById('export-png-2x').onclick = () => exportHighResPNG(2);
        document.getElementById('export-png-4x').onclick = () => exportHighResPNG(4);
        document.getElementById('export-svg-btn').onclick = () => exportSVG();
        
        document.getElementById('close-export').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        };
    }
    
    // ======================
    // ANALYTICS
    // ======================
    
    function calculateNetworkMetrics() {
        if (!window.nodes || !window.links) {
            return null;
        }
        
        const nodes = window.nodes;
        const links = window.links;
        
        const degrees = {};
        nodes.forEach(n => degrees[n.id] = 0);
        links.forEach(l => {
            degrees[l.source.id || l.source]++;
            degrees[l.target.id || l.target]++;
        });
        
        const sortedByDegree = nodes.map(n => ({
            name: n.name,
            degree: degrees[n.id],
            type: n.type
        })).sort((a, b) => b.degree - a.degree);
        
        const n = nodes.length;
        const maxLinks = (n * (n - 1)) / 2;
        const density = maxLinks > 0 ? (links.length / maxLinks) : 0;
        
        const typeCount = {};
        nodes.forEach(n => {
            typeCount[n.type] = (typeCount[n.type] || 0) + 1;
        });
        
        return {
            nodeCount: nodes.length,
            linkCount: links.length,
            density: density.toFixed(3),
            avgDegree: (links.length * 2 / nodes.length).toFixed(2),
            topConnected: sortedByDegree.slice(0, 5),
            typeDistribution: typeCount
        };
    }
    
    function showAnalytics() {
        const metrics = calculateNetworkMetrics();
        if (!metrics) {
            alert('No network data to analyze');
            return;
        }
        
        let html = `
            <div style="padding: 20px; max-width: 600px;">
                <h2>Network Analytics</h2>
                
                <h3>Overview</h3>
                <ul>
                    <li><strong>Entities:</strong> ${metrics.nodeCount}</li>
                    <li><strong>Relationships:</strong> ${metrics.linkCount}</li>
                    <li><strong>Network Density:</strong> ${metrics.density}</li>
                    <li><strong>Average Connections:</strong> ${metrics.avgDegree}</li>
                </ul>
                
                <h3>Most Connected Entities</h3>
                <ol>
                    ${metrics.topConnected.map(n => 
                        `<li><strong>${n.name}</strong> (${n.type}) - ${n.degree} connections</li>`
                    ).join('')}
                </ol>
                
                <h3>Entity Types</h3>
                <ul>
                    ${Object.entries(metrics.typeDistribution).map(([type, count]) => 
                        `<li><strong>${type}:</strong> ${count}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 8px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        content.innerHTML = html;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #f0f0f0;
            border: none;
            border-radius: 4px;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 18px;
        `;
        closeBtn.onclick = () => document.body.removeChild(modal);
        
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.onclick = (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        };
    }
    
    // ======================
    // EXPORT UTILITIES
    // ======================
    
    function exportAsGraphML() {
        if (!window.nodes || !window.links) {
            alert('No network data to export');
            return;
        }
        
        let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="label" for="edge" attr.name="label" attr.type="string"/>
  <graph id="G" edgedefault="undirected">
`;
        
        window.nodes.forEach(node => {
            graphml += `    <node id="${node.id}">
      <data key="name">${escapeXml(node.name)}</data>
      <data key="type">${escapeXml(node.type)}</data>
    </node>
`;
        });
        
        window.links.forEach((link, i) => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            graphml += `    <edge id="e${i}" source="${sourceId}" target="${targetId}">
      <data key="label">${escapeXml(link.label || '')}</data>
    </edge>
`;
        });
        
        graphml += `  </graph>
</graphml>`;
        
        downloadFile(graphml, 'network.graphml', 'application/xml');
    }
    
    function exportAsCSV() {
        if (!window.nodes || !window.links) {
            alert('No network data to export');
            return;
        }
        
        let nodesCSV = 'id,name,type\n';
        window.nodes.forEach(node => {
            nodesCSV += `${node.id},"${node.name}","${node.type}"\n`;
        });
        downloadFile(nodesCSV, 'nodes.csv', 'text/csv');
        
        let edgesCSV = 'source,target,label\n';
        window.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            edgesCSV += `${sourceId},${targetId},"${link.label || ''}"\n`;
        });
        downloadFile(edgesCSV, 'edges.csv', 'text/csv');
    }
    
    function escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // ======================
    // UI SETUP
    // ======================
    
    function setupEnhancedUI() {
        const controlSection = document.querySelector('.control-section');
        if (!controlSection) return;
        
        const enhancedSection = document.createElement('div');
        enhancedSection.className = 'control-section';
        enhancedSection.innerHTML = `
            <h3>🎨 Enhanced Features</h3>
            
            <div class="form-group">
                <label>Theme</label>
                <select id="theme-selector">
                    ${Object.entries(THEMES).map(([key, theme]) => 
                        `<option value="${key}">${theme.name}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="button-group">
                <button id="theme-builder-btn">🎨 Theme Builder</button>
            </div>
            
            <div class="form-group">
                <label>Search Entities</label>
                <input type="text" id="search-input" placeholder="Search...">
                <small id="search-results"></small>
            </div>
            
            <div class="form-group">
                <label>Layout</label>
                <select id="layout-selector">
                    <option value="force">Force-Directed</option>
                    <option value="circular">Circular</option>
                    <option value="radial">Radial</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="timeline">Timeline</option>
                </select>
            </div>
            
            <div class="button-group">
                <button id="undo-btn" title="Undo (Ctrl+Z)">↶ Undo</button>
                <button id="redo-btn" title="Redo (Ctrl+Y)">↷ Redo</button>
            </div>
            
            <div class="button-group">
                <button id="analytics-btn">📊 Analytics</button>
                <button id="export-enhanced-btn">💾 Export</button>
            </div>
            
            <div class="button-group">
                <button id="export-graphml-btn">GraphML</button>
                <button id="export-csv-btn">CSV</button>
            </div>
        `;
        
        controlSection.parentNode.insertBefore(enhancedSection, controlSection.nextSibling);
        
        // Event listeners - use event delegation to ensure it persists
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', function(e) {
                console.log('🎨 Theme selector changed to:', e.target.value);
                applyTheme(e.target.value);
            });
            console.log('✅ Theme selector event listener attached');
        } else {
            console.error('❌ Theme selector not found!');
        }
        
        document.getElementById('theme-builder-btn').addEventListener('click', showThemeBuilder);
        
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        searchInput.addEventListener('input', (e) => {
            const count = searchEntities(e.target.value);
            if (e.target.value) {
                searchResults.textContent = count ? `Found ${count} matches` : 'No matches';
            } else {
                searchResults.textContent = '';
            }
        });
        
        document.getElementById('layout-selector').addEventListener('change', (e) => {
            switch(e.target.value) {
                case 'circular': applyCircularLayout(); break;
                case 'radial': applyRadialLayout(); break;
                case 'hierarchical': applyHierarchicalLayout(); break;
                case 'timeline': applyTimelineLayout(); break;
            }
        });
        
        document.getElementById('undo-btn').addEventListener('click', undo);
        document.getElementById('redo-btn').addEventListener('click', redo);
        document.getElementById('analytics-btn').addEventListener('click', showAnalytics);
        document.getElementById('export-enhanced-btn').addEventListener('click', showExportModal);
        document.getElementById('export-graphml-btn').addEventListener('click', exportAsGraphML);
        document.getElementById('export-csv-btn').addEventListener('click', exportAsCSV);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        });
        
        // Hook into original add entity/relationship functions
        setTimeout(() => {
            const entityForm = document.getElementById('entity-form');
            const relationshipForm = document.getElementById('relationship-form');
            
            if (entityForm) {
                entityForm.addEventListener('submit', () => {
                    setTimeout(saveState, 100);
                });
            }
            
            if (relationshipForm) {
                relationshipForm.addEventListener('submit', () => {
                    setTimeout(saveState, 100);
                });
            }
            
            // Save initial state
            saveState();
        }, 2000);
    }
    
    // ======================
    // INITIALIZATION
    // ======================
    
    function init() {
        console.log('🚀 Initializing Enhanced Features V2...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(setupEnhancedUI, 1000);
            });
        } else {
            setTimeout(setupEnhancedUI, 1000);
        }
        
        applyTheme('lombardi');
        
        console.log('✅ Enhanced Features V2 loaded');
        console.log('📝 Features: Themes, Analytics, Export, Undo/Redo, Search, Layouts, Theme Builder');
    }
    
    init();
    
})();
