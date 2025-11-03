// Interactive highlighting feature
let selectedNode = null;

function highlightConnections(clickedNode) {
    const svg = d3.select('#network-svg');
    
    // If clicking the same node, reset
    if (selectedNode && selectedNode.id === clickedNode.id) {
        resetHighlight();
        selectedNode = null;
        return;
    }
    
    selectedNode = clickedNode;
    
    // Find all connected nodes
    const connectedNodes = new Set([clickedNode.id]);
    const connectedLinks = new Set();
    
    const state = window.silentPartners.state || window.state;
    if (!state || !state.links) {
        console.error('State not available');
        return;
    }
    
    state.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === clickedNode.id) {
            connectedNodes.add(targetId);
            connectedLinks.add(link);
        } else if (targetId === clickedNode.id) {
            connectedNodes.add(sourceId);
            connectedLinks.add(link);
        }
    });
    
    // Dim all nodes
    svg.selectAll('circle')
        .transition()
        .duration(300)
        .attr('opacity', d => connectedNodes.has(d.id) ? 1 : 0.15)
        .attr('stroke-width', d => d.id === clickedNode.id ? 4 : 1);
    
    // Dim all links
    svg.selectAll('path')
        .transition()
        .duration(300)
        .attr('opacity', d => connectedLinks.has(d) ? 0.8 : 0.05);
    
    // Dim all labels
    svg.selectAll('text')
        .transition()
        .duration(300)
        .attr('opacity', d => connectedNodes.has(d.id) ? 1 : 0.15);
    
    console.log(`Highlighted ${clickedNode.name} with ${connectedNodes.size - 1} connections`);
}

function resetHighlight() {
    const svg = d3.select('#network-svg');
    
    if (!svg.node()) {
        console.error('SVG not found');
        return;
    }
    
    // Reset all nodes
    svg.selectAll('circle')
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr('stroke-width', 1);
    
    // Reset all links
    svg.selectAll('path')
        .transition()
        .duration(300)
        .attr('opacity', d => {
            // Restore original opacity based on status
            if (d.status === 'confirmed') return 0.85;
            if (d.status === 'suspected') return 0.4;
            if (d.status === 'former') return 0.25;
            return 0.6;
        });
    
    // Reset all labels
    svg.selectAll('text')
        .transition()
        .duration(300)
        .attr('opacity', 1);
    
    console.log('Reset highlight');
}

// Click on background to reset
document.addEventListener('DOMContentLoaded', function() {
    const svg = document.getElementById('network-svg');
    if (svg) {
        svg.addEventListener('click', function(e) {
            if (e.target === svg || e.target.tagName === 'svg') {
                resetHighlight();
                selectedNode = null;
            }
        });
    }
});
