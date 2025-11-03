/**
 * Silent Partners - Enhanced Features
 * Adds themes, analytics, and advanced export without breaking the original
 */

(function() {
    'use strict';
    
    console.log('🎨 Loading Silent Partners enhancements...');
    
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
        }
    };
    
    let currentTheme = 'lombardi';
    
    function applyTheme(themeName) {
        const theme = THEMES[themeName];
        if (!theme) return;
        
        currentTheme = themeName;
        
        // Apply to body and main elements
        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.text;
        
        // Apply to sidebar
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.backgroundColor = theme.sidebar;
            controls.style.color = theme.text;
        }
        
        // Apply to canvas
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.style.backgroundColor = theme.background;
        }
        
        // Update CSS variables
        document.documentElement.style.setProperty('--bg-color', theme.background);
        document.documentElement.style.setProperty('--text-color', theme.text);
        document.documentElement.style.setProperty('--line-color', theme.line);
        document.documentElement.style.setProperty('--node-color', theme.node);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        
        // Redraw visualization with new colors
        if (window.updateVisualization) {
            window.updateVisualization();
        }
        
        console.log(`🎨 Applied theme: ${theme.name}`);
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
        
        // Calculate degree for each node
        const degrees = {};
        nodes.forEach(n => degrees[n.id] = 0);
        links.forEach(l => {
            degrees[l.source.id || l.source]++;
            degrees[l.target.id || l.target]++;
        });
        
        // Find most connected
        const sortedByDegree = nodes.map(n => ({
            name: n.name,
            degree: degrees[n.id],
            type: n.type
        })).sort((a, b) => b.degree - a.degree);
        
        // Calculate network density
        const n = nodes.length;
        const maxLinks = (n * (n - 1)) / 2;
        const density = maxLinks > 0 ? (links.length / maxLinks) : 0;
        
        // Entity type distribution
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
        
        // Create modal
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
    // ADVANCED EXPORT
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
        
        // Add nodes
        window.nodes.forEach(node => {
            graphml += `    <node id="${node.id}">
      <data key="name">${escapeXml(node.name)}</data>
      <data key="type">${escapeXml(node.type)}</data>
    </node>
`;
        });
        
        // Add edges
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
        
        // Export nodes
        let nodesCSV = 'id,name,type\n';
        window.nodes.forEach(node => {
            nodesCSV += `${node.id},"${node.name}","${node.type}"\n`;
        });
        downloadFile(nodesCSV, 'nodes.csv', 'text/csv');
        
        // Export edges
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
        // Add theme selector to controls
        const controlSection = document.querySelector('.control-section');
        if (controlSection) {
            const themeSection = document.createElement('div');
            themeSection.className = 'control-section';
            themeSection.innerHTML = `
                <h3>🎨 Theme</h3>
                <div class="form-group">
                    <select id="theme-selector">
                        ${Object.entries(THEMES).map(([key, theme]) => 
                            `<option value="${key}">${theme.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="button-group">
                    <button id="analytics-btn">📊 Analytics</button>
                </div>
                <div class="button-group">
                    <button id="export-graphml-btn">Export GraphML</button>
                    <button id="export-csv-btn">Export CSV</button>
                </div>
            `;
            
            // Insert after the first control section
            controlSection.parentNode.insertBefore(themeSection, controlSection.nextSibling);
            
            // Add event listeners
            document.getElementById('theme-selector').addEventListener('change', (e) => {
                applyTheme(e.target.value);
            });
            
            document.getElementById('analytics-btn').addEventListener('click', showAnalytics);
            document.getElementById('export-graphml-btn').addEventListener('click', exportAsGraphML);
            document.getElementById('export-csv-btn').addEventListener('click', exportAsCSV);
        }
    }
    
    // ======================
    // INITIALIZATION
    // ======================
    
    function init() {
        console.log('🚀 Initializing enhancements...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(setupEnhancedUI, 1000); // Wait for original to load
            });
        } else {
            setTimeout(setupEnhancedUI, 1000);
        }
        
        // Apply default theme
        applyTheme('lombardi');
        
        console.log('✅ Enhancements loaded');
    }
    
    // Start initialization
    init();
    
})();
