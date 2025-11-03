/**
 * Working Enhancements for Silent Partners
 * Simple, direct integration with existing visualization
 */

(function() {
    'use strict';
    
    console.log('🚀 Working enhancements loading...');
    
    // Wait for everything to load
    function init() {
        console.log('🔧 Initializing working enhancements...');
        
        // Check if Silent Partners is ready
        if (!window.silentPartners || !window.silentPartners.applyTheme) {
            console.log('⏳ Waiting for Silent Partners...');
            setTimeout(init, 500);
            return;
        }
        
        console.log('✅ Silent Partners ready, adding enhancements...');
        
        // Add theme functionality
        addThemeSupport();
        
        // Add layout functionality  
        addLayoutSupport();
        
        console.log('✅ Enhancements ready!');
    }
    
    function createEnhancedUI() {
        const controls = document.getElementById('controls');
        if (!controls) return;
        
        // Find the Example Networks section
        const sections = controls.querySelectorAll('.control-section');
        const exampleSection = Array.from(sections).find(s => s.textContent.includes('Example Networks'));
        
        if (!exampleSection) return;
        
        // Create Enhanced Features section
        const enhancedSection = document.createElement('div');
        enhancedSection.className = 'control-section';
        enhancedSection.innerHTML = `
            <h3>🎨 Enhanced Features</h3>
            
            <div class="form-group">
                <label for="theme-select">Theme</label>
                <select id="theme-select">
                    <option>Lombardi Classic</option>
                    <option>Clean Minimal</option>
                    <option>Dark Mode</option>
                    <option>Corporate</option>
                    <option>Vibrant</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="layout-select-enhanced">Layout</label>
                <select id="layout-select-enhanced">
                    <option>Force-Directed</option>
                    <option>Circular</option>
                    <option>Radial</option>
                    <option>Hierarchical</option>
                    <option>Timeline</option>
                </select>
            </div>
        `;
        
        // Insert after Example Networks
        exampleSection.parentNode.insertBefore(enhancedSection, exampleSection.nextSibling);
        
        console.log('✅ Enhanced UI created');
    }
    
    // ======================
    // THEME SUPPORT
    // ======================
    
    function addThemeSupport() {
        const themeSelect = document.getElementById('theme-select');
        if (!themeSelect) {
            console.warn('Theme selector not found');
            return;
        }
        
        themeSelect.addEventListener('change', function(e) {
            const theme = e.target.value;
            console.log('🎨 Applying theme:', theme);
            window.silentPartners.applyTheme(theme);
        });
        console.log('✅ Theme selector connected');
    }
    
    function applyTheme(themeName) {
        const themes = {
            'Lombardi Classic': {
                background: '#F5F2ED',
                sidebar: '#FFFFFF',
                text: '#2A2A2A',
                nodeColor: '#2A2A2A',
                linkColor: '#2A2A2A'
            },
            'Clean Minimal': {
                background: '#FFFFFF',
                sidebar: '#F8F8F8',
                text: '#000000',
                nodeColor: '#000000',
                linkColor: '#CCCCCC'
            },
            'Dark Mode': {
                background: '#1A1A1A',
                sidebar: '#252525',
                text: '#FFFFFF',
                nodeColor: '#FFFFFF',
                linkColor: '#666666'
            },
            'Corporate': {
                background: '#F0F4F8',
                sidebar: '#FFFFFF',
                text: '#2C3E50',
                nodeColor: '#3498DB',
                linkColor: '#95A5A6'
            },
            'Vibrant': {
                background: '#FFF9E6',
                sidebar: '#FFFFFF',
                text: '#2A2A2A',
                nodeColor: '#E74C3C',
                linkColor: '#F39C12'
            }
        };
        
        const theme = themes[themeName];
        if (!theme) {
            console.warn('Unknown theme:', themeName);
            return;
        }
        
        // Apply to body/canvas
        document.body.style.backgroundColor = theme.background;
        const visualization = document.getElementById('visualization');
        if (visualization) {
            visualization.style.backgroundColor = theme.background;
        }
        
        // Apply to sidebar
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.backgroundColor = theme.sidebar;
            controls.style.color = theme.text;
        }
        
        // Apply to SVG elements
        const svg = d3.select('#network-svg');
        
        // Update links
        svg.selectAll('.link')
            .style('stroke', theme.linkColor);
        
        // Update nodes
        svg.selectAll('.node circle')
            .style('fill', theme.nodeColor)
            .style('stroke', theme.nodeColor);
        
        // Update labels
        svg.selectAll('.node text')
            .style('fill', theme.text);
        
        console.log('✅ Theme applied:', themeName);
    }
    
    // ======================
    // LAYOUT SUPPORT
    // ======================
    
    function addLayoutSupport() {
        const layoutSelect = document.getElementById('layout-select-enhanced');
        if (!layoutSelect) {
            console.warn('Layout selector not found');
            return;
        }
        
        layoutSelect.addEventListener('change', function(e) {
            const layout = e.target.value;
            console.log('📐 Applying layout:', layout);
            window.silentPartners.applyLayout(layout);
        });
        console.log('✅ Layout selector connected');
    }
    
    function applyLayout(layoutName) {
        if (!window.nodes || !window.links || !window.simulation) {
            console.error('Visualization not ready');
            return;
        }
        
        const width = document.getElementById('network-svg').clientWidth;
        const height = document.getElementById('network-svg').clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        
        console.log(`Applying ${layoutName} layout to ${window.nodes.length} nodes...`);
        
        switch(layoutName) {
            case 'Circular':
                applyCircularLayout(centerX, centerY);
                break;
            case 'Radial':
                applyRadialLayout(centerX, centerY);
                break;
            case 'Hierarchical':
                applyHierarchicalLayout(centerX, centerY);
                break;
            case 'Timeline':
                applyTimelineLayout(centerX, centerY);
                break;
            default:
                // Force-directed - restart simulation
                window.simulation.alpha(1).restart();
                console.log('✅ Force-directed layout applied');
                return;
        }
        
        // Update positions
        window.simulation.alpha(0.3).restart();
        console.log('✅ Layout applied:', layoutName);
    }
    
    function applyCircularLayout(centerX, centerY) {
        const radius = Math.min(centerX, centerY) * 0.7;
        const angleStep = (2 * Math.PI) / window.nodes.length;
        
        window.nodes.forEach((node, i) => {
            const angle = i * angleStep;
            node.fx = centerX + radius * Math.cos(angle);
            node.fy = centerY + radius * Math.sin(angle);
        });
    }
    
    function applyRadialLayout(centerX, centerY) {
        // Calculate importance for each node
        const linkCounts = {};
        window.nodes.forEach(n => linkCounts[n.id] = 0);
        window.links.forEach(l => {
            linkCounts[l.source.id || l.source]++;
            linkCounts[l.target.id || l.target]++;
        });
        
        // Sort by importance
        const sorted = [...window.nodes].sort((a, b) => 
            linkCounts[b.id] - linkCounts[a.id]
        );
        
        // Most important in center
        sorted[0].fx = centerX;
        sorted[0].fy = centerY;
        
        // Others in concentric circles
        let layer = 1;
        let nodesInLayer = 6;
        let nodeIndex = 1;
        
        while (nodeIndex < sorted.length) {
            const radius = layer * 150;
            const nodesThisLayer = Math.min(nodesInLayer, sorted.length - nodeIndex);
            const angleStep = (2 * Math.PI) / nodesThisLayer;
            
            for (let i = 0; i < nodesThisLayer; i++) {
                const angle = i * angleStep;
                sorted[nodeIndex].fx = centerX + radius * Math.cos(angle);
                sorted[nodeIndex].fy = centerY + radius * Math.sin(angle);
                nodeIndex++;
            }
            
            layer++;
            nodesInLayer += 6;
        }
    }
    
    function applyHierarchicalLayout(centerX, centerY) {
        // Simple tree layout
        const levels = {};
        window.nodes.forEach(n => levels[n.id] = 0);
        
        // Calculate levels based on connections
        window.links.forEach(l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            levels[targetId] = Math.max(levels[targetId], levels[sourceId] + 1);
        });
        
        // Group by level
        const levelGroups = {};
        window.nodes.forEach(n => {
            const level = levels[n.id];
            if (!levelGroups[level]) levelGroups[level] = [];
            levelGroups[level].push(n);
        });
        
        // Position nodes
        const maxLevel = Math.max(...Object.keys(levelGroups).map(Number));
        const levelHeight = (centerY * 1.6) / (maxLevel + 1);
        
        Object.keys(levelGroups).forEach(level => {
            const nodes = levelGroups[level];
            const y = 100 + Number(level) * levelHeight;
            const spacing = (centerX * 1.8) / (nodes.length + 1);
            
            nodes.forEach((node, i) => {
                node.fx = 100 + (i + 1) * spacing;
                node.fy = y;
            });
        });
    }
    
    function applyTimelineLayout(centerX, centerY) {
        // Sort by date if available
        const nodesWithDates = window.nodes.filter(n => n.date);
        const nodesWithoutDates = window.nodes.filter(n => !n.date);
        
        if (nodesWithDates.length === 0) {
            console.warn('No dates found, using horizontal layout');
            // Fallback to simple horizontal layout
            window.nodes.forEach((node, i) => {
                node.fx = 100 + (i * (centerX * 1.8) / window.nodes.length);
                node.fy = centerY;
            });
            return;
        }
        
        // Sort by date
        nodesWithDates.sort((a, b) => {
            const dateA = parseInt(a.date) || 0;
            const dateB = parseInt(b.date) || 0;
            return dateA - dateB;
        });
        
        // Position along timeline
        const spacing = (centerX * 1.8) / (nodesWithDates.length + 1);
        nodesWithDates.forEach((node, i) => {
            node.fx = 100 + (i + 1) * spacing;
            node.fy = centerY;
        });
        
        // Position nodes without dates at the end
        nodesWithoutDates.forEach((node, i) => {
            node.fx = 100 + (nodesWithDates.length + i + 1) * spacing;
            node.fy = centerY + 100;
        });
    }
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }
    
})();
