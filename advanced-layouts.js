/**
 * Advanced Layout Algorithms for Silent Partners
 * Provides meaningful and attractive graph arrangements
 */

(function() {
    'use strict';
    
    // ======================
    // LAYOUT 1: IMPORTANCE-WEIGHTED FORCE
    // ======================
    
    window.applyImportanceWeightedLayout = function() {
        if (!window.nodes || !window.links) {
            console.error('No graph data available');
            return;
        }
        
        console.log('🎯 Applying Importance-Weighted Force Layout...');
        
        // Calculate importance scores if not already set
        window.nodes.forEach(node => {
            if (!node.importance) {
                // Calculate based on connections (degree centrality)
                const connections = window.links.filter(l => 
                    l.source.id === node.id || l.target.id === node.id
                ).length;
                node.importance = Math.min(connections / 10, 1); // Normalize to 0-1
            }
        });
        
        // Stop existing simulation
        if (window.simulation) {
            window.simulation.stop();
        }
        
        const width = window.innerWidth - 300;
        const height = window.innerHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Create new simulation with importance-weighted forces
        window.simulation = d3.forceSimulation(window.nodes)
            .force("link", d3.forceLink(window.links)
                .id(d => d.id)
                .distance(d => {
                    // Shorter links for important nodes
                    const sourceImp = d.source.importance || 0.5;
                    const targetImp = d.target.importance || 0.5;
                    return 100 - ((sourceImp + targetImp) / 2 * 50);
                })
            )
            .force("charge", d3.forceManyBody()
                .strength(d => {
                    // Stronger repulsion for important nodes (need more space)
                    return -300 * (1 + (d.importance || 0.5));
                })
            )
            .force("center", d3.forceCenter(centerX, centerY))
            .force("radial", d3.forceRadial()
                .radius(d => {
                    // Important nodes closer to center
                    return 200 - ((d.importance || 0.5) * 150);
                })
                .x(centerX)
                .y(centerY)
                .strength(0.3)
            )
            .force("collision", d3.forceCollide()
                .radius(d => {
                    // Larger collision radius for important nodes
                    return 20 + ((d.importance || 0.5) * 30);
                })
            )
            .on("tick", ticked);
        
        function ticked() {
            // Update link positions
            d3.selectAll(".link")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            // Update node positions
            d3.selectAll(".node")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            
            // Update labels
            d3.selectAll(".node-label")
                .attr("x", d => d.x)
                .attr("y", d => d.y - 15);
        }
        
        console.log('✅ Importance-Weighted Layout applied');
    };
    
    // ======================
    // LAYOUT 2: COMMUNITY-CLUSTERED
    // ======================
    
    window.applyCommunityClusteredLayout = function() {
        if (!window.nodes || !window.links) {
            console.error('No graph data available');
            return;
        }
        
        console.log('🎯 Applying Community-Clustered Layout...');
        
        // Detect communities using simple algorithm
        const communities = detectCommunities(window.nodes, window.links);
        
        // Assign community colors
        const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];
        communities.forEach((community, idx) => {
            community.forEach(nodeId => {
                const node = window.nodes.find(n => n.id === nodeId);
                if (node) {
                    node.community = idx;
                    node.communityColor = colors[idx % colors.length];
                }
            });
        });
        
        // Stop existing simulation
        if (window.simulation) {
            window.simulation.stop();
        }
        
        const width = window.innerWidth - 300;
        const height = window.innerHeight;
        const numCommunities = communities.length;
        
        // Calculate community centers in a circle
        const communityCenters = [];
        for (let i = 0; i < numCommunities; i++) {
            const angle = (i / numCommunities) * 2 * Math.PI;
            const radius = Math.min(width, height) * 0.3;
            communityCenters.push({
                x: width/2 + radius * Math.cos(angle),
                y: height/2 + radius * Math.sin(angle)
            });
        }
        
        // Create simulation with community clustering
        window.simulation = d3.forceSimulation(window.nodes)
            .force("link", d3.forceLink(window.links)
                .id(d => d.id)
                .distance(d => {
                    // Shorter links within same community
                    return d.source.community === d.target.community ? 50 : 150;
                })
                .strength(d => {
                    // Stronger links within same community
                    return d.source.community === d.target.community ? 1 : 0.3;
                })
            )
            .force("charge", d3.forceManyBody()
                .strength(-200)
            )
            .force("community", d3.forceRadial()
                .radius(100)
                .x(d => communityCenters[d.community % numCommunities].x)
                .y(d => communityCenters[d.community % numCommunities].y)
                .strength(0.5)
            )
            .force("collision", d3.forceCollide().radius(25))
            .on("tick", ticked);
        
        function ticked() {
            // Update link positions
            d3.selectAll(".link")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            // Update node positions and colors
            d3.selectAll(".node")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("fill", d => d.communityColor || LOMBARDI_COLORS.node);
            
            // Update labels
            d3.selectAll(".node-label")
                .attr("x", d => d.x)
                .attr("y", d => d.y - 15);
        }
        
        console.log(`✅ Community-Clustered Layout applied (${numCommunities} communities)`);
    };
    
    // Simple community detection using connected components and modularity
    function detectCommunities(nodes, links) {
        // Build adjacency list
        const adj = {};
        nodes.forEach(n => adj[n.id] = []);
        links.forEach(l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            adj[sourceId].push(targetId);
            adj[targetId].push(sourceId);
        });
        
        // Find connected components
        const visited = new Set();
        const communities = [];
        
        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                const community = [];
                const queue = [node.id];
                
                while (queue.length > 0) {
                    const current = queue.shift();
                    if (visited.has(current)) continue;
                    
                    visited.add(current);
                    community.push(current);
                    
                    // Add neighbors (limit community size for better visualization)
                    if (community.length < 20) {
                        adj[current].forEach(neighbor => {
                            if (!visited.has(neighbor)) {
                                queue.push(neighbor);
                            }
                        });
                    }
                }
                
                if (community.length > 0) {
                    communities.push(community);
                }
            }
        });
        
        // If too few communities, split largest ones
        while (communities.length < 3 && communities.some(c => c.length > 10)) {
            const largest = communities.reduce((max, c) => c.length > max.length ? c : max);
            const idx = communities.indexOf(largest);
            const mid = Math.floor(largest.length / 2);
            communities.splice(idx, 1, largest.slice(0, mid), largest.slice(mid));
        }
        
        return communities;
    }
    
    // ======================
    // LAYOUT 3: TEMPORAL FLOW
    // ======================
    
    window.applyTemporalFlowLayout = function() {
        if (!window.nodes || !window.links) {
            console.error('No graph data available');
            return;
        }
        
        console.log('🎯 Applying Temporal Flow Layout...');
        
        // Check if nodes have dates
        const nodesWithDates = window.nodes.filter(n => n.date);
        
        if (nodesWithDates.length === 0) {
            alert('Temporal Flow layout requires dates on entities. Please add dates first.');
            console.warn('No dates found on nodes');
            return;
        }
        
        // Parse and sort by date
        window.nodes.forEach(node => {
            if (node.date) {
                node.timestamp = new Date(node.date).getTime();
            } else {
                node.timestamp = Date.now(); // Default to now
            }
        });
        
        const minTime = Math.min(...window.nodes.map(n => n.timestamp));
        const maxTime = Math.max(...window.nodes.map(n => n.timestamp));
        const timeRange = maxTime - minTime || 1;
        
        // Stop existing simulation
        if (window.simulation) {
            window.simulation.stop();
        }
        
        const width = window.innerWidth - 300;
        const height = window.innerHeight;
        const margin = 100;
        
        // Position nodes based on time (x-axis) and importance (y-axis)
        window.nodes.forEach(node => {
            // X position based on time
            const timeProgress = (node.timestamp - minTime) / timeRange;
            node.fx = margin + (width - 2 * margin) * timeProgress;
            
            // Y position based on importance (calculated from connections)
            const connections = window.links.filter(l => 
                (l.source.id || l.source) === node.id || 
                (l.target.id || l.target) === node.id
            ).length;
            node.importance = Math.min(connections / 10, 1);
            node.fy = height/2 + (Math.random() - 0.5) * 200 - (node.importance * 100);
        });
        
        // Create simulation with fixed positions
        window.simulation = d3.forceSimulation(window.nodes)
            .force("link", d3.forceLink(window.links)
                .id(d => d.id)
                .distance(100)
                .strength(0.3)
            )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("collision", d3.forceCollide().radius(30))
            .on("tick", ticked);
        
        function ticked() {
            // Update link positions
            d3.selectAll(".link")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            // Update node positions (x is fixed by time)
            d3.selectAll(".node")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            
            // Update labels
            d3.selectAll(".node-label")
                .attr("x", d => d.x)
                .attr("y", d => d.y - 15);
        }
        
        // Draw timeline axis
        drawTimelineAxis(minTime, maxTime, width, height, margin);
        
        console.log('✅ Temporal Flow Layout applied');
    };
    
    function drawTimelineAxis(minTime, maxTime, width, height, margin) {
        // Remove existing axis
        d3.select('#timeline-axis').remove();
        
        // Create axis group
        const svg = d3.select('#canvas');
        const axisGroup = svg.append('g')
            .attr('id', 'timeline-axis');
        
        // Draw axis line
        axisGroup.append('line')
            .attr('x1', margin)
            .attr('y1', height - 50)
            .attr('x2', width - margin)
            .attr('y2', height - 50)
            .attr('stroke', '#666')
            .attr('stroke-width', 2);
        
        // Add time labels
        const numLabels = 5;
        for (let i = 0; i <= numLabels; i++) {
            const progress = i / numLabels;
            const x = margin + (width - 2 * margin) * progress;
            const time = minTime + (maxTime - minTime) * progress;
            const date = new Date(time);
            
            axisGroup.append('text')
                .attr('x', x)
                .attr('y', height - 30)
                .attr('text-anchor', 'middle')
                .attr('fill', '#666')
                .attr('font-size', '14px')
                .text(date.getFullYear());
        }
    }
    
    // ======================
    // LAYOUT SELECTOR UI
    // ======================
    
    function addAdvancedLayoutsToUI() {
        const layoutSelector = document.getElementById('layout-selector');
        if (!layoutSelector) {
            console.warn('Layout selector not found');
            return;
        }
        
        // Add new layout options
        const options = [
            { value: 'importance', text: 'Importance-Weighted' },
            { value: 'community', text: 'Community-Clustered' },
            { value: 'temporal', text: 'Temporal Flow' }
        ];
        
        options.forEach(opt => {
            // Check if option already exists
            const exists = Array.from(layoutSelector.options).some(o => o.value === opt.value);
            if (!exists) {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                layoutSelector.appendChild(option);
            }
        });
        
        // Update event listener to handle new layouts
        const oldListener = layoutSelector.onchange;
        layoutSelector.onchange = function(e) {
            const value = e.target.value;
            
            switch(value) {
                case 'importance':
                    applyImportanceWeightedLayout();
                    break;
                case 'community':
                    applyCommunityClusteredLayout();
                    break;
                case 'temporal':
                    applyTemporalFlowLayout();
                    break;
                default:
                    if (oldListener) oldListener.call(this, e);
            }
        };
        
        console.log('✅ Advanced layouts added to UI');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addAdvancedLayoutsToUI, 2000);
        });
    } else {
        setTimeout(addAdvancedLayoutsToUI, 2000);
    }
    
    console.log('📐 Advanced Layouts module loaded');
    
})();
