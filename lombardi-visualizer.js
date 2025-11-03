/**

- Silent Partners - Lombardi-style Network Visualizer
- Main JavaScript Module
- 
- A tool for creating network visualizations in the tradition of Mark Lombardi
  */

// UNCONDITIONAL TOP-LEVEL LOGGING
console.log('🔍 lombardi-visualizer.js loaded and executing');
try {
console.log('🔍 Window object exists in visualizer:', !!window);
console.log('🔍 Document object exists in visualizer:', !!document);
} catch (e) {
console.error('🔍 Error accessing window/document in visualizer:', e);
}

// Initialize the global object
console.log('🔍 Initializing silentPartners object in visualizer');
window.silentPartners = window.silentPartners || {};

// State object to store visualization data
let state = {
nodes: [],
links: [],
simulation: null,
svg: null,
g: null,
linkGroup: null,
nodeGroup: null,
labelGroup: null,
dateGroup: null,
zoom: null,
nextNodeId: 1,
currentLayout: 'force',
curvature: 1.0, // INCREASED from 0.6 for maximum Lombardi-style curves
selectedFormat: 'print',
showDates: false
};

// ===== Constants =====
const LOMBARDI_COLORS = {
nodes: {
person: "rgba(249, 246, 238, 0.6)",
corporation: "rgba(245, 245, 245, 0.6)",
government: "rgba(240, 234, 214, 0.6)",
financial: "rgba(255, 250, 240, 0.6)",
organization: "rgba(248, 248, 255, 0.6)"
},
lines: {
confirmed: "rgba(26, 26, 26, 0.85)",
suspected: "rgba(26, 26, 26, 0.4)",
former: "rgba(26, 26, 26, 0.25)",
highlight: "#C41E3A"
},
text: "#2A2A2A",
background: "#F9F7F4"
};

const EXPORT_FORMATS = {
square: { width: 2400, height: 2400, name: 'Instagram' },
landscape: { width: 2400, height: 1350, name: 'Twitter/Web' },
print: { width: 2400, height: 3000, name: 'High Resolution' }
};

// ===== Initialization =====
window.silentPartners.init = function() {
try {
console.log("Initializing Silent Partners application…");
initializeVisualization();
setupEventListeners();
updateEntitySelectors();
checkUrlParameter();

    // Initialize toggle button position (sidebar starts open, so show X icon)
    const toggleButton = document.getElementById("toggle-controls");
    if (toggleButton) {
        toggleButton.classList.add("sidebar-open");
        toggleButton.classList.add("active");
    }

    // Hide loading screen after initialization
    console.log("Initialization complete, hiding loading screen");
    const loadingScreen = document.getElementById("loading");
    if (loadingScreen) {
        loadingScreen.style.display = "none";
    } else {
        console.error("Loading screen element not found");
    }
} catch (error) {
    console.error("Error during initialization:", error);
    // Still try to hide loading screen even if there was an error
    try {
        document.getElementById("loading").style.display = "none";
        console.log("✅ Silent Partners initialization complete");
    } catch (e) {
        console.error("Could not hide loading screen:", e);
    }
}

};

function initializeVisualization() {
// Initialize SVG and groups
state.svg = d3.select("#network-svg")
.attr("width", "100%")
.attr("height", "100%");

// Create zoom behavior
state.zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", zoomed);

state.svg.call(state.zoom);

// Create main group that will be transformed
state.g = state.svg.append("g");

// Create groups for different elements
state.linkGroup = state.g.append("g").attr("class", "links");
state.nodeGroup = state.g.append("g").attr("class", "nodes");
state.labelGroup = state.g.append("g").attr("class", "labels");
state.dateGroup = state.g.append("g").attr("class", "dates");

// Initialize force simulation with better spacing for clarity
state.simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(150)) // Increased from 100
    .force("charge", d3.forceManyBody().strength(-500)) // Increased from -300
    .force("collide", d3.forceCollide().radius(d => 30 + (d.importance || 0.5) * 20)) // Prevent overlap
    .force("center", d3.forceCenter(
        document.getElementById("network-svg").clientWidth / 2,
        document.getElementById("network-svg").clientHeight / 2
    ))
    .on("tick", ticked);

// Center the view
resetZoom();

}

function zoomed(event) {
state.g.attr("transform", event.transform);
}

function resetZoom() {
state.svg.transition().duration(750).call(
state.zoom.transform,
d3.zoomIdentity.translate(
document.getElementById("network-svg").clientWidth / 2,
document.getElementById("network-svg").clientHeight / 2
).scale(0.8)
);
}

function setupEventListeners() {
try {
// Entity form
const entityForm = document.getElementById("entity-form");
if (entityForm) {
entityForm.addEventListener("submit", function(e) {
e.preventDefault();
addEntity();
});
} else {
console.error("Entity form element not found");
}

    // Relationship form
    const relationshipForm = document.getElementById("relationship-form");
    if (relationshipForm) {
        relationshipForm.addEventListener("submit", function(e) {
            e.preventDefault();
            addRelationship();
        });
    } else {
        console.error("Relationship form element not found");
    }
    
    // Layout controls
    const layoutSelect = document.getElementById("layout-select");
    if (layoutSelect) {
        layoutSelect.addEventListener("change", function(e) {
            changeLayout(e.target.value);
        });
    } else {
        console.error("Layout select element not found");
    }
    
    const curvatureSlider = document.getElementById("curvature-slider");
    if (curvatureSlider) {
        curvatureSlider.value = state.curvature; // Set initial value
        document.getElementById("curvature-value").textContent = state.curvature.toFixed(1);
        curvatureSlider.addEventListener("input", function(e) {
            changeCurvature(parseFloat(e.target.value));
        });
    }
    
    const showDates = document.getElementById("show-dates");
    if (showDates) {
        showDates.addEventListener("change", function(e) {
            toggleDates(e.target.checked);
        });
    }
    
    const regenerateLayoutBtn = document.getElementById("regenerate-layout");
    if (regenerateLayoutBtn) {
        regenerateLayoutBtn.addEventListener("click", function() {
            regenerateLayout();
        });
    }
    
    // Export controls
    const createArtwork = document.getElementById("create-artwork");
    if (createArtwork) {
        createArtwork.addEventListener("click", function() {
            showExportModal();
        });
    }
    
    const exportClose = document.getElementById("export-close");
    if (exportClose) {
        exportClose.addEventListener("click", function() {
            hideExportModal();
        });
    }
    
    const downloadArtworkBtn = document.getElementById("download-artwork");
    if (downloadArtworkBtn) {
        downloadArtworkBtn.addEventListener("click", function() {
            downloadArtwork();
        });
    }
    
    const shareArtworkBtn = document.getElementById("share-artwork");
    if (shareArtworkBtn) {
        shareArtworkBtn.addEventListener("click", function() {
            shareToSocial();
        });
    }
    
    // Format selection
    const formatButtons = document.querySelectorAll(".format-option");
    formatButtons.forEach(button => {
        button.addEventListener("click", function() {
            selectFormat(this.getAttribute("data-format"));
        });
    });
    
    // Example networks
    const load1mdb = document.getElementById("load-1mdb");
    if (load1mdb) {
        load1mdb.addEventListener("click", function() {
            window.silentPartners.loadExampleNetwork('oneMDB');
        });
    }
    
    const loadBcci = document.getElementById("load-bcci");
    if (loadBcci) {
        loadBcci.addEventListener("click", function() {
            window.silentPartners.loadExampleNetwork('bcci');
        });
    }
    
    const loadEpstein = document.getElementById("load-epstein");
    if (loadEpstein) {
        loadEpstein.addEventListener("click", function() {
            window.silentPartners.loadExampleNetwork('epstein');
        });
    }
    
    const clearNetworkBtn = document.getElementById("clear-network");
    if (clearNetworkBtn) {
        clearNetworkBtn.addEventListener("click", function() {
            clearNetwork();
        });
    }
    
    // Data import/export
    const exportDataBtn = document.getElementById("export-data");
    if (exportDataBtn) {
        exportDataBtn.addEventListener("click", function() {
            exportNetworkData();
        });
    }
    
    const importDataBtn = document.getElementById("import-data");
    if (importDataBtn) {
        importDataBtn.addEventListener("click", function() {
            importNetworkData();
        });
    }
    
    // Local storage
    const saveBrowser = document.getElementById("save-browser");
    if (saveBrowser) {
        saveBrowser.addEventListener("click", function() {
            saveToLocalStorage();
        });
    }
    
    const loadBrowser = document.getElementById("load-browser");
    if (loadBrowser) {
        loadBrowser.addEventListener("click", function() {
            loadFromLocalStorage();
        });
    }
    
    // Toggle controls for mobile
    const toggleControls = document.getElementById("toggle-controls");
    if (toggleControls) {
        toggleControls.addEventListener("click", function() {
            toggleControlPanel();
        });
    }
    
    // Title card toggle
    const showTitleCard = document.getElementById("show-title-card");
    if (showTitleCard) {
        showTitleCard.addEventListener("change", function(e) {
            toggleTitleCard(e.target.checked);
        });
    }
    
    // Import file input
    const importFileInput = document.getElementById("import-file-input");
    if (importFileInput) {
        importFileInput.addEventListener("change", function(e) {
            handleFileImport(e);
        });
    }
    
    // Info panel toggle
    const infoToggle = document.getElementById("info-toggle");
    if (infoToggle) {
        infoToggle.addEventListener("click", function() {
            toggleInfoPanel();
        });
    }
    
    const infoClose = document.getElementById("info-close");
    if (infoClose) {
        infoClose.addEventListener("click", function() {
            hideInfoPanel();
        });
    }
    
    // Support button toggle
    const supportToggle = document.getElementById("support-toggle");
    const supportOptions = document.getElementById("support-options");
    if (supportToggle && supportOptions) {
        supportToggle.addEventListener("click", function(e) {
            e.stopPropagation();
            supportOptions.classList.toggle("show");
        });
    }
    
    // Enhanced Features: Theme selector
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', function(e) {
            const themeName = e.target.value;
            console.log('🎨 Theme changed to:', themeName);
            if (window.silentPartners && window.silentPartners.applyTheme) {
                window.silentPartners.applyTheme(themeName);
            }
        });
        console.log('✅ Theme selector connected');
    }
    
    // Enhanced Features: Layout selector
    const layoutSelectEnhanced = document.getElementById('layout-select-enhanced');
    if (layoutSelectEnhanced) {
        layoutSelectEnhanced.addEventListener('change', function(e) {
            const layoutName = e.target.value;
            console.log('📐 Layout changed to:', layoutName);
            if (window.silentPartners && window.silentPartners.applyLayout) {
                window.silentPartners.applyLayout(layoutName);
            }
        });
        console.log('✅ Layout selector connected');
    }
    
    // Close info panel when clicking outside
    document.addEventListener("click", function(e) {
        const infoPanel = document.getElementById("info-panel");
        const infoToggleBtn = document.getElementById("info-toggle");
        const supportOptionsEl = document.getElementById("support-options");
        const supportToggleBtn = document.getElementById("support-toggle");
        
        // Close info panel
        if (infoPanel && infoToggleBtn && 
            !infoPanel.contains(e.target) && 
            !infoToggleBtn.contains(e.target)) {
            hideInfoPanel();
        }
        
        // Close support dropdown
        if (supportOptionsEl && supportToggleBtn &&
            !supportOptionsEl.contains(e.target) &&
            !supportToggleBtn.contains(e.target)) {
            supportOptionsEl.classList.remove("show");
        }
    });
} catch (error) {
    console.error("Error setting up event listeners:", error);
}

}

function updateEntitySelectors() {
const sourceSelect = document.getElementById("source-entity");
const targetSelect = document.getElementById("target-entity");

if (!sourceSelect || !targetSelect) {
    console.error("Entity selectors not found");
    return;
}

// Clear existing options except the first one
while (sourceSelect.options.length > 1) {
    sourceSelect.remove(1);
}

while (targetSelect.options.length > 1) {
    targetSelect.remove(1);
}

// Add options for each entity
state.nodes.forEach(node => {
    const sourceOption = document.createElement("option");
    sourceOption.value = node.id;
    sourceOption.textContent = node.name;
    sourceSelect.appendChild(sourceOption);
    
    const targetOption = document.createElement("option");
    targetOption.value = node.id;
    targetOption.textContent = node.name;
    targetSelect.appendChild(targetOption);
});

}

function checkUrlParameter() {
const urlParams = new URLSearchParams(window.location.search);
const networkParam = urlParams.get('network');

if (networkParam) {
    if (networkParam === '1mdb' || networkParam === 'oneMDB') {
        window.silentPartners.loadExampleNetwork('oneMDB');
    } else if (networkParam === 'bcci') {
        window.silentPartners.loadExampleNetwork('bcci');
    } else if (networkParam === 'epstein') {
        window.silentPartners.loadExampleNetwork('epstein');
    }
}

}

// ===== Network Visualization =====
function ticked() {
// Update link positions
const links = state.linkGroup.selectAll("path")
.data(state.links);

links.attr("d", createLinkPath);

// Update node positions
const nodes = state.nodeGroup.selectAll("circle")
    .data(state.nodes);

nodes.attr("cx", d => d.x)
    .attr("cy", d => d.y);

// Update label positions
const labels = state.labelGroup.selectAll("text")
    .data(state.nodes);

labels.attr("x", d => d.x)
    .attr("y", d => d.y + 20);

// Update date annotations
if (state.showDates) {
    const dates = state.dateGroup.selectAll("text")
        .data(state.links.filter(d => d.date));
    
    dates.attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 10);
}

}

function createLinkPath(d) {
const dx = d.target.x - d.source.x;
const dy = d.target.y - d.source.y;
const dr = Math.sqrt(dx * dx + dy * dy) * state.curvature; // More pronounced curves

// Different line styles based on relationship status
if (d.status === "suspected") {
    return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
} else if (d.status === "former") {
    return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
} else {
    return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
}

}

window.silentPartners.updateVisualization = function() {
// Update links
const links = state.linkGroup.selectAll("path")
.data(state.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

links.exit().remove();

links.enter()
    .append("path")
    .attr("stroke", d => LOMBARDI_COLORS.lines[d.status || "confirmed"])
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .attr("marker-end", "url(#arrowhead)")
    .on("mouseover", function(event, d) {
        showTooltip(event, `${d.type || "Relationship"} ${d.date ? `(${d.date})` : ""}`);
        d3.select(this).attr("stroke", LOMBARDI_COLORS.lines.highlight);
    })
    .on("mouseout", function() {
        hideTooltip();
        d3.select(this).attr("stroke", d => LOMBARDI_COLORS.lines[d.status || "confirmed"]);
    });

// Update nodes
const nodes = state.nodeGroup.selectAll("circle")
    .data(state.nodes, d => d.id);

nodes.exit().remove();

nodes.enter()
    .append("circle")
    .attr("r", d => 5 + (d.importance || 0.5) * 10)
    .attr("fill", d => LOMBARDI_COLORS.nodes[d.type || "person"])
    .attr("stroke", LOMBARDI_COLORS.text)
    .attr("stroke-width", 1)
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("mouseover", function(event, d) {
        showTooltip(event, d.name);
        d3.select(this).attr("stroke-width", 2);
    })
    .on("mouseout", function() {
        hideTooltip();
        d3.select(this).attr("stroke-width", 1);
    });

// Update labels
const labels = state.labelGroup.selectAll("text")
    .data(state.nodes, d => d.id);

labels.exit().remove();

labels.enter()
    .append("text")
    .text(d => d.name)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", LOMBARDI_COLORS.text)
    .attr("pointer-events", "none");

// Update date annotations
if (state.showDates) {
    const dates = state.dateGroup.selectAll("text")
        .data(state.links.filter(d => d.date), d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    
    dates.exit().remove();
    
    dates.enter()
        .append("text")
        .text(d => d.date)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", LOMBARDI_COLORS.text)
        .attr("pointer-events", "none")
        .attr("opacity", 0.7);
} else {
    state.dateGroup.selectAll("text").remove();
}

// Update simulation
state.simulation.nodes(state.nodes);
state.simulation.force("link").links(state.links);
state.simulation.alpha(1).restart();

};

function dragstarted(event, d) {
if (!event.active) state.simulation.alphaTarget(0.3).restart();
d.fx = d.x;
d.fy = d.y;
}

function dragged(event, d) {
d.fx = event.x;
d.fy = event.y;
}

function dragended(event, d) {
if (!event.active) state.simulation.alphaTarget(0);
d.fx = null;
d.fy = null;
}

// ===== Entity Management =====
function addEntity() {
const name = document.getElementById("entity-name").value.trim();
const type = document.getElementById("entity-type").value;
const importance = parseFloat(document.getElementById("entity-importance").value);
const date = document.getElementById("entity-date").value.trim();

if (!name) {
    alert("Entity name is required");
    return;
}

const id = `node_${state.nextNodeId++}`;
const newNode = {
    id: id,
    name: name,
    type: type,
    importance: importance
};

if (date) {
    newNode.date = date;
}

state.nodes.push(newNode);
window.silentPartners.updateVisualization();
updateEntitySelectors();
updateEntityList();

// Clear form
document.getElementById("entity-name").value = "";
document.getElementById("entity-importance").value = "0.5";
document.getElementById("entity-date").value = "";

}

window.silentPartners.addNodeFromData = function(nodeData) {
// If node already has an ID, use it; otherwise generate one
const id = nodeData.id || `node_${state.nextNodeId++}`;

const newNode = {
    id: id,
    name: nodeData.name,
    type: nodeData.type || "person",
    importance: nodeData.importance || 0.5
};

if (nodeData.date) {
    newNode.date = nodeData.date;
}

state.nodes.push(newNode);
return newNode;

};

function updateEntityList() {
const entityList = document.getElementById("entity-list");
if (!entityList) return;

entityList.innerHTML = "";

state.nodes.forEach(node => {
    const entityItem = document.createElement("div");
    entityItem.className = "entity-item";
    entityItem.innerHTML = `
        <span class="entity-name">${node.name}</span>
        <span class="entity-type">${node.type}</span>
        <button class="remove-entity" data-id="${node.id}">×</button>
    `;
    entityList.appendChild(entityItem);
});

// Add event listeners to remove buttons
const removeButtons = document.querySelectorAll(".remove-entity");
removeButtons.forEach(button => {
    button.addEventListener("click", function() {
        const nodeId = this.getAttribute("data-id");
        removeEntity(nodeId);
    });
});

}

function removeEntity(nodeId) {
// Remove all links connected to this node
state.links = state.links.filter(link =>
link.source.id !== nodeId && link.target.id !== nodeId
);

// Remove the node
state.nodes = state.nodes.filter(node => node.id !== nodeId);

// Update visualization
window.silentPartners.updateVisualization();
updateEntitySelectors();
updateEntityList();
updateRelationshipList();

}

// ===== Relationship Management =====
function addRelationship() {
const sourceId = document.getElementById("source-entity").value;
const targetId = document.getElementById("target-entity").value;
const type = document.getElementById("relationship-type").value.trim();
const value = document.getElementById("relationship-value").value.trim();
const date = document.getElementById("relationship-date").value.trim();
const status = document.getElementById("relationship-status").value;

if (!sourceId || !targetId) {
    alert("Both source and target entities are required");
    return;
}

if (sourceId === targetId) {
    alert("Source and target cannot be the same entity");
    return;
}

// Check if relationship already exists
const exists = state.links.some(link => 
    (link.source.id === sourceId && link.target.id === targetId) ||
    (link.source.id === targetId && link.target.id === sourceId)
);

if (exists) {
    alert("A relationship between these entities already exists");
    return;
}

const newLink = {
    source: sourceId,
    target: targetId,
    type: type,
    status: status
};

if (date) {
    newLink.date = date;
}

if (value) {
    newLink.value = parseFloat(value);
}

state.links.push(newLink);
window.silentPartners.updateVisualization();
updateRelationshipList();

// Clear form
document.getElementById("source-entity").selectedIndex = 0;
document.getElementById("target-entity").selectedIndex = 0;
document.getElementById("relationship-type").value = "";
document.getElementById("relationship-value").value = "";
document.getElementById("relationship-date").value = "";
document.getElementById("relationship-status").selectedIndex = 0;

}

window.silentPartners.addLinkFromData = function(linkData) {
const newLink = {
source: linkData.source,
target: linkData.target,
type: linkData.type || "",
status: linkData.status || "confirmed"
};

if (linkData.date) {
    newLink.date = linkData.date;
}

if (linkData.value) {
    newLink.value = linkData.value;
}

state.links.push(newLink);
return newLink;

};

function updateRelationshipList() {
const relationshipList = document.getElementById("relationship-list");
if (!relationshipList) return;

relationshipList.innerHTML = "";

state.links.forEach((link, index) => {
    // Find node names
    const sourceNode = state.nodes.find(node => node.id === link.source.id || node.id === link.source);
    const targetNode = state.nodes.find(node => node.id === link.target.id || node.id === link.target);
    
    if (!sourceNode || !targetNode) return;
    
    const relationshipItem = document.createElement("div");
    relationshipItem.className = "relationship-item";
    relationshipItem.innerHTML = `
        <span class="relationship-entities">${sourceNode.name} → ${targetNode.name}</span>
        <span class="relationship-type">${link.type || "Relationship"}</span>
        <button class="remove-relationship" data-index="${index}">×</button>
    `;
    relationshipList.appendChild(relationshipItem);
});

// Add event listeners to remove buttons
const removeButtons = document.querySelectorAll(".remove-relationship");
removeButtons.forEach(button => {
    button.addEventListener("click", function() {
        const index = parseInt(this.getAttribute("data-index"));
        removeRelationship(index);
    });
});

}

function removeRelationship(index) {
state.links.splice(index, 1);
window.silentPartners.updateVisualization();
updateRelationshipList();
}

// ===== Layout Controls =====
function changeLayout(layoutType) {
state.currentLayout = layoutType;

// Stop current simulation
state.simulation.stop();

// Reset node positions
state.nodes.forEach(node => {
    node.fx = null;
    node.fy = null;
});

// Configure new layout
switch (layoutType) {
    case "force":
        state.simulation
            .force("link", d3.forceLink().id(d => d.id).distance(150)) // Increased spacing
            .force("charge", d3.forceManyBody().strength(-500)) // Stronger repulsion
            .force("collide", d3.forceCollide().radius(d => 30 + (d.importance || 0.5) * 20)) // Prevent overlap
            .force("center", d3.forceCenter(
                document.getElementById("network-svg").clientWidth / 2,
                document.getElementById("network-svg").clientHeight / 2
            ));
        break;
        
    case "circular":
        const radius = Math.min(
            document.getElementById("network-svg").clientWidth,
            document.getElementById("network-svg").clientHeight
        ) * 0.4;
        
        state.nodes.forEach((node, i) => {
            const angle = (i / state.nodes.length) * 2 * Math.PI;
            node.x = document.getElementById("network-svg").clientWidth / 2 + radius * Math.cos(angle);
            node.y = document.getElementById("network-svg").clientHeight / 2 + radius * Math.sin(angle);
            node.fx = node.x;
            node.fy = node.y;
        });
        
        state.simulation
            .force("link", d3.forceLink().id(d => d.id).distance(150)) // Better spacing
            .force("charge", null)
            .force("collide", d3.forceCollide().radius(d => 30 + (d.importance || 0.5) * 20))
            .force("center", null);
        break;
        
    case "radial":
        // Find the most connected node as the center
        const nodeDegrees = state.nodes.map(node => {
            return {
                id: node.id,
                degree: state.links.filter(link => 
                    link.source.id === node.id || link.target.id === node.id
                ).length
            };
        });
        
        nodeDegrees.sort((a, b) => b.degree - a.degree);
        const centerNodeId = nodeDegrees[0].id;
        
        // Set center node position
        const centerNode = state.nodes.find(node => node.id === centerNodeId);
        centerNode.x = document.getElementById("network-svg").clientWidth / 2;
        centerNode.y = document.getElementById("network-svg").clientHeight / 2;
        centerNode.fx = centerNode.x;
        centerNode.fy = centerNode.y;
        
        state.simulation
            .force("link", d3.forceLink().id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", null);
        break;
        
    case "timeline":
        // Check if nodes have date information
        const nodesWithDates = state.nodes.filter(node => node.date);
        
        if (nodesWithDates.length > 0) {
            // Extract years from dates (assuming format like "2020" or "2020-2022")
            const extractYear = dateStr => {
                const match = dateStr.match(/(\d{4})/);
                return match ? parseInt(match[1]) : null;
            };
            
            const years = nodesWithDates.map(node => extractYear(node.date)).filter(year => year !== null);
            
            if (years.length > 0) {
                const minYear = Math.min(...years);
                const maxYear = Math.max(...years);
                const yearRange = maxYear - minYear || 1;
                
                const width = document.getElementById("network-svg").clientWidth * 0.8;
                const startX = document.getElementById("network-svg").clientWidth * 0.1;
                
                state.nodes.forEach(node => {
                    if (node.date) {
                        const year = extractYear(node.date);
                        if (year !== null) {
                            const x = startX + (width * (year - minYear) / yearRange);
                            node.x = x;
                            node.fx = x;
                            
                            // Randomize Y position
                            node.y = document.getElementById("network-svg").clientHeight * 0.3 + Math.random() * document.getElementById("network-svg").clientHeight * 0.4;
                            node.fy = node.y;
                        }
                    }
                });
                
                state.simulation
                    .force("link", d3.forceLink().id(d => d.id).distance(100))
                    .force("charge", d3.forceManyBody().strength(-50))
                    .force("center", null);
            } else {
                alert("Timeline layout requires nodes with valid date information (YYYY format)");
                document.getElementById("layout-select").value = "force";
                changeLayout("force");
            }
        } else {
            alert("Timeline layout requires nodes with date information");
            document.getElementById("layout-select").value = "force";
            changeLayout("force");
        }
        break;
}

// Restart simulation
state.simulation.alpha(1).restart();

}

function changeCurvature(value) {
state.curvature = value;
document.getElementById("curvature-value").textContent = value.toFixed(1);
window.silentPartners.updateVisualization();
}

function toggleDates(show) {
state.showDates = show;
window.silentPartners.updateVisualization();
}

function regenerateLayout() {
// Reset node positions
state.nodes.forEach(node => {
node.fx = null;
node.fy = null;
});

// Restart simulation
state.simulation.alpha(1).restart();

}

// ===== Export Functions =====
function showExportModal() {
const modal = document.getElementById("export-modal");
if (modal) {
modal.style.display = "flex";
renderExportPreview();
}
}

function hideExportModal() {
const modal = document.getElementById("export-modal");
if (modal) {
modal.style.display = "none";
}
}

function selectFormat(format) {
state.selectedFormat = format;

// Update UI
document.querySelectorAll(".format-option").forEach(option => {
    option.classList.remove("selected");
});

const selectedOption = document.querySelector(`.format-option[data-format="${format}"]`);
if (selectedOption) {
    selectedOption.classList.add("selected");
}

// Re-render preview
renderExportPreview();

}

function renderExportPreview() {
const canvas = document.getElementById("export-preview");
if (!canvas) return;

const ctx = canvas.getContext("2d");
const format = EXPORT_FORMATS[state.selectedFormat];

// Set canvas dimensions
canvas.width = format.width;
canvas.height = format.height;

// Scale canvas for display
const containerWidth = canvas.parentElement.clientWidth;
canvas.style.width = `${containerWidth}px`;
canvas.style.height = `${containerWidth * (format.height / format.width)}px`;

// Fill background
ctx.fillStyle = LOMBARDI_COLORS.background;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Get network bounds
const bounds = getNetworkBounds();

// Calculate scale and translation to fit network in canvas with LESS padding for bigger diagram
const padding = 0.05; // REDUCED from 0.10 to make diagram larger
const scale = Math.min(
    format.width * (1 - padding * 2) / (bounds.width || 1),
    format.height * 0.75 / (bounds.height || 1) // Use more vertical space
);

const translateX = (format.width / 2) - ((bounds.minX + bounds.width / 2) * scale);
const translateY = (format.height * 0.45) - ((bounds.minY + bounds.height / 2) * scale); // Center higher to leave room for text

// Draw title - LARGER
const title = document.getElementById("export-title").value || document.getElementById("network-title").value || "Untitled Network";
const subtitle = document.getElementById("export-subtitle").value || "";
const notes = document.getElementById("export-notes").value || document.getElementById("network-description").value || "";

ctx.fillStyle = LOMBARDI_COLORS.text;
ctx.font = `bold ${format.width * 0.04}px 'Garamond', 'Baskerville', serif`; // Using serif font
ctx.textAlign = "center";
ctx.fillText(title, format.width / 2, format.height * 0.06);

if (subtitle) {
    ctx.font = `${format.width * 0.025}px 'Garamond', 'Baskerville', serif`; // Using serif font
    ctx.fillText(subtitle, format.width / 2, format.height * 0.09);
}

// Draw links with EXACT same curves as main visualization
ctx.lineWidth = 1.5 * scale;
state.links.forEach(link => {
    const source = {
        x: link.source.x * scale + translateX,
        y: link.source.y * scale + translateY
    };
    
    const target = {
        x: link.target.x * scale + translateX,
        y: link.target.y * scale + translateY
    };
    
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dr = Math.sqrt(dx * dx + dy * dy) * state.curvature; // Use state.curvature
    
    ctx.beginPath();
    ctx.strokeStyle = LOMBARDI_COLORS.lines[link.status || "confirmed"];
    
    if (link.status === "former") {
        // Straight line for former relationships
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
    } else {
        // Draw SVG-style arc curve - matching the main visualization exactly
        ctx.moveTo(source.x, source.y);
        
        // Convert SVG arc to canvas arc
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = dr;
        
        // Calculate control point for quadratic curve that approximates the SVG arc
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // Perpendicular offset for curve
        const offsetX = -dy / distance * radius * 0.4; // Adjust factor to match SVG arc
        const offsetY = dx / distance * radius * 0.4;
        
        const controlX = midX + offsetX;
        const controlY = midY + offsetY;
        
        ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);
    }
    
    ctx.stroke();
    
    // Draw arrowhead with better positioning for curved lines
    let angle;
    if (link.status === "former") {
        angle = Math.atan2(target.y - source.y, target.x - source.x);
    } else {
        // Calculate angle from control point to target for better arrow positioning
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = dr;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const offsetX = -dy / distance * radius * 0.4;
        const offsetY = dx / distance * radius * 0.4;
        const controlX = midX + offsetX;
        const controlY = midY + offsetY;
        angle = Math.atan2(target.y - controlY, target.x - controlX);
    }
    
    const arrowSize = 5 * scale;
    
    ctx.beginPath();
    ctx.moveTo(target.x, target.y);
    ctx.lineTo(
        target.x - arrowSize * Math.cos(angle - Math.PI / 6),
        target.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        target.x - arrowSize * Math.cos(angle + Math.PI / 6),
        target.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = LOMBARDI_COLORS.lines[link.status || "confirmed"];
    ctx.fill();
    
    // Draw relationship type and date if showDates is enabled
    if (state.showDates && link.date) {
        ctx.font = `${12 * scale}px 'Garamond', 'Baskerville', serif`; // Using serif font
        ctx.fillStyle = LOMBARDI_COLORS.text;
        ctx.textAlign = "center";
        
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2 - 10 * scale;
        
        // Add text stroke for better readability
        ctx.strokeStyle = LOMBARDI_COLORS.background;
        ctx.lineWidth = 2 * scale;
        ctx.strokeText(link.date, midX, midY);
        ctx.fillText(link.date, midX, midY);
    }
});

// Draw nodes
state.nodes.forEach(node => {
    const x = node.x * scale + translateX;
    const y = node.y * scale + translateY;
    const radius = (5 + (node.importance || 0.5) * 10) * scale;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = LOMBARDI_COLORS.nodes[node.type || "person"];
    ctx.fill();
    ctx.strokeStyle = LOMBARDI_COLORS.text;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    
    // Draw node label - LARGER and using serif font to match main visualization
    ctx.font = `${12 * scale}px 'Garamond', 'Baskerville', serif`; // Using serif font like main vis
    ctx.fillStyle = LOMBARDI_COLORS.text;
    ctx.textAlign = "center";
    
    // Add text stroke for better readability like main visualization
    ctx.strokeStyle = LOMBARDI_COLORS.background;
    ctx.lineWidth = 3 * scale;
    ctx.strokeText(node.name, x, y + 22 * scale);
    ctx.fillText(node.name, x, y + 22 * scale);
});

// Draw notes at bottom if provided
if (notes) {
    ctx.font = `${format.width * 0.018}px 'Garamond', 'Baskerville', serif`; // Using serif font
    ctx.textAlign = "center";
    ctx.fillStyle = LOMBARDI_COLORS.text;
    
    // Split notes into lines if too long
    const maxWidth = format.width * 0.8;
    const words = notes.split(' ');
    let line = '';
    let lines = [];
    let y = format.height * 0.88; // Moved up slightly
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    
    lines.forEach((line, i) => {
        ctx.fillText(line, format.width / 2, y + i * (format.width * 0.025)); // Increased line spacing
    });
}

// Draw attribution - NEW TEXT
ctx.font = `${format.width * 0.02}px 'Garamond', 'Baskerville', serif`; // Using serif font
ctx.textAlign = "center";
ctx.fillStyle = LOMBARDI_COLORS.text;
ctx.fillText(
    "Created with SilentPartners.app — A Brazen Production",
    format.width / 2,
    format.height * 0.97
);

}

function getNetworkBounds() {
if (state.nodes.length === 0) {
return { minX: 0, minY: 0, width: 100, height: 100 };
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

state.nodes.forEach(node => {
    const radius = 5 + (node.importance || 0.5) * 10;
    
    minX = Math.min(minX, node.x - radius);
    minY = Math.min(minY, node.y - radius);
    maxX = Math.max(maxX, node.x + radius);
    maxY = Math.max(maxY, node.y + radius);
});

// Add space for labels
minY = Math.min(minY, minY - 20);
maxY = Math.max(maxY, maxY + 20);

return {
    minX: minX,
    minY: minY,
    width: maxX - minX,
    height: maxY - minY
};

}

function downloadArtwork() {
const canvas = document.getElementById("export-preview");
if (!canvas) return;

const title = document.getElementById("export-title").value || document.getElementById("network-title").value || "untitled-network";
const filename = title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.png';

// Create a temporary link and trigger download
const link = document.createElement('a');
link.download = filename;
link.href = canvas.toDataURL('image/png');
link.click();

}

function shareToSocial() {
const canvas = document.getElementById("export-preview");
if (!canvas) return;

// Convert canvas to blob
canvas.toBlob(function(blob) {
    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'network.png', { type: 'image/png' })] })) {
        navigator.share({
            title: document.getElementById("export-title").value || document.getElementById("network-title").value || "Silent Partners Network",
            text: document.getElementById("export-notes").value || document.getElementById("network-description").value || "Network visualization created with Silent Partners",
            files: [new File([blob], 'network.png', { type: 'image/png' })]
        }).catch(error => {
            console.error("Error sharing:", error);
            fallbackShare(canvas);
        });
    } else {
        fallbackShare(canvas);
    }
});

}

function fallbackShare(canvas) {
// Fallback to opening a new window with the image
const imageUrl = canvas.toDataURL('image/png');
const w = window.open('');
w.document.write(`<html> <head> <title>Share Network Visualization</title> <style> body { font-family: sans-serif; text-align: center; background: #f5f5f5; padding: 20px; } img { max-width: 100%; border: 1px solid #ddd; box-shadow: 0 2px 10px rgba(0,0,0,0.1); } p { margin: 20px 0; } </style> </head> <body> <h2>Share Network Visualization</h2> <p>Right-click on the image and select "Save Image As..." to download, then share manually.</p> <img src="${imageUrl}" alt="Network Visualization"> </body> </html>`);
}

// ===== Data Import/Export =====
function exportNetworkData() {
// Prepare data for export
const data = {
version: "1.0",
timestamp: new Date().toISOString(),
title: document.getElementById("network-title").value || "Untitled Network",
description: document.getElementById("network-description").value || "",
nodes: state.nodes.map(node => ({
id: node.id,
name: node.name,
type: node.type,
importance: node.importance,
date: node.date
})),
links: state.links.map(link => ({
source: typeof link.source === 'object' ? link.source.id : link.source,
target: typeof link.target === 'object' ? link.target.id : link.target,
type: link.type,
status: link.status,
date: link.date,
value: link.value
}))
};

// Convert to JSON string
const jsonString = JSON.stringify(data, null, 2);

// Create blob and download
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const filename = (data.title || 'network').toLowerCase().replace(/[^a-z0-9]/g, '-') + '.json';

const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();

// Clean up
URL.revokeObjectURL(url);

}

function importNetworkData() {
const fileInput = document.getElementById("import-file-input");
if (fileInput) {
fileInput.click();
}
}

function handleFileImport(event) {
const file = event.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = function(e) {
    try {
        const data = JSON.parse(e.target.result);
        
        // Check various data structures for compatibility
        if (!data.nodes && !data.entities && !data.data) {
            throw new Error("Invalid import data: missing nodes");
        }
        
        // Load the data
        window.silentPartners.loadNetworkData(data);
        
        // Reset file input
        event.target.value = null;
    } catch (error) {
        console.error("Error importing data:", error);
        alert("Error importing network data: " + error.message);
    }
};

reader.readAsText(file);

}

// FIXED: Add the missing loadNetworkData function
window.silentPartners.loadNetworkData = function(data) {
try {
// Clear current network
state.nodes = [];
state.links = [];
state.nextNodeId = 1;

    // Handle different data formats
    let nodes = data.nodes || data.entities || (data.data && data.data.nodes) || [];
    let links = data.links || data.edges || data.relationships || (data.data && data.data.links) || [];
    
    // Load metadata
    if (data.title) {
        document.getElementById("network-title").value = data.title;
    }
    if (data.description) {
        document.getElementById("network-description").value = data.description;
    }
    
    // Create a map for node IDs
    const nodeIdMap = {};
    
    // Load nodes
    nodes.forEach(nodeData => {
        const node = window.silentPartners.addNodeFromData(nodeData);
        nodeIdMap[nodeData.id || nodeData.name] = node.id;
    });
    
    // Load links with ID mapping
    links.forEach(linkData => {
        // Map source and target to actual node IDs
        const mappedLink = {
            source: nodeIdMap[linkData.source] || linkData.source,
            target: nodeIdMap[linkData.target] || linkData.target,
            type: linkData.type || linkData.relationship || "",
            status: linkData.status || "confirmed",
            date: linkData.date,
            value: linkData.value
        };
        
        // Only add link if both source and target exist
        const sourceExists = state.nodes.some(n => n.id === mappedLink.source);
        const targetExists = state.nodes.some(n => n.id === mappedLink.target);
        
        if (sourceExists && targetExists) {
            window.silentPartners.addLinkFromData(mappedLink);
        } else {
            console.warn("Skipping link with missing nodes:", linkData);
        }
    });
    
    // Update visualization
    window.silentPartners.updateVisualization();
    updateEntitySelectors();
    updateEntityList();
    updateRelationshipList();
    
    // Reset zoom to show the entire network
    setTimeout(() => {
        resetZoom();
    }, 500);
    
} catch (error) {
    console.error("Error loading network data:", error);
    alert("Error loading network: " + error.message);
}

};

// ===== Local Storage =====
function saveToLocalStorage() {
try {
const data = {
title: document.getElementById("network-title").value || "Untitled Network",
description: document.getElementById("network-description").value || "",
nodes: state.nodes.map(node => ({
id: node.id,
name: node.name,
type: node.type,
importance: node.importance,
date: node.date
})),
links: state.links.map(link => ({
source: typeof link.source === 'object' ? link.source.id : link.source,
target: typeof link.target === 'object' ? link.target.id : link.target,
type: link.type,
status: link.status,
date: link.date,
value: link.value
}))
};

    localStorage.setItem('silentPartners_savedNetwork', JSON.stringify(data));
    alert("Network saved to browser storage");
} catch (error) {
    console.error("Error saving to local storage:", error);
    alert("Error saving network: " + error.message);
}

}

function loadFromLocalStorage() {
try {
const savedData = localStorage.getItem('silentPartners_savedNetwork');
if (!savedData) {
alert("No saved network found in browser storage");
return;
}

    const data = JSON.parse(savedData);
    window.silentPartners.loadNetworkData(data);
    alert("Network loaded from browser storage");
} catch (error) {
    console.error("Error loading from local storage:", error);
    alert("Error loading network: " + error.message);
}

}

// ===== UI Controls =====
function toggleControlPanel() {
    const controls = document.getElementById("controls");
    const toggleButton = document.getElementById("toggle-controls");

    if (controls) {
        const isMinimized = controls.classList.contains("minimized");
        controls.classList.toggle("minimized");
        
        // Update toggle button position and state based on sidebar state
        if (toggleButton) {
            if (!isMinimized) {
                // Sidebar is being hidden - show hamburger icon, button at left edge
                toggleButton.classList.remove("sidebar-open");
                toggleButton.classList.remove("active");
            } else {
                // Sidebar is being shown - show X icon, move button to right of sidebar
                toggleButton.classList.add("sidebar-open");
                toggleButton.classList.add("active");
            }
        }
    }
}

function toggleTitleCard(show) {
const titleCard = document.getElementById("artworkTitle");
if (titleCard) {
titleCard.style.display = show ? "block" : "none";
}

// Update title card content
if (show) {
    document.getElementById("titleCardTitle").textContent = document.getElementById("network-title").value || "Untitled Network";
    document.getElementById("titleCardNotes").textContent = document.getElementById("network-description").value || "Network visualization";
}

}

// ===== Info Panel Controls =====
function toggleInfoPanel() {
    const infoPanel = document.getElementById("info-panel");
    if (infoPanel) {
        const isVisible = infoPanel.classList.contains("show");
        if (isVisible) {
            hideInfoPanel();
        } else {
            showInfoPanel();
        }
    }
}

function showInfoPanel() {
    const infoPanel = document.getElementById("info-panel");
    if (infoPanel) {
        infoPanel.classList.add("show");
    }
}

function hideInfoPanel() {
    const infoPanel = document.getElementById("info-panel");
    if (infoPanel) {
        infoPanel.classList.remove("show");
    }
}

// ===== Tooltip =====
function showTooltip(event, text) {
const tooltip = document.querySelector(".hover-info");
if (!tooltip) return;

tooltip.textContent = text;
tooltip.style.display = "block";
tooltip.style.left = (event.pageX + 10) + "px";
tooltip.style.top = (event.pageY + 10) + "px";

}

function hideTooltip() {
const tooltip = document.querySelector(".hover-info");
if (tooltip) {
tooltip.style.display = "none";
}
}

// ===== Example Networks =====
window.silentPartners.loadExampleNetwork = function(networkName) {
console.log(`Loading example network: ${networkName}`);

// Check if we have initial data for this network
if (window.silentPartners.initialData && window.silentPartners.initialData[networkName]) {
    console.log(`Loading local ${networkName} data`);
    window.silentPartners.loadNetworkData(window.silentPartners.initialData[networkName]);
} else {
    console.error(`No initial data found for ${networkName}`);
}

};

// ===== Network Management =====
function clearNetwork() {
if (confirm("Are you sure you want to clear the current network?")) {
state.nodes = [];
state.links = [];
state.nextNodeId = 1;

    // Clear form fields
    document.getElementById("network-title").value = "";
    document.getElementById("network-description").value = "";
    
    // Update visualization
    window.silentPartners.updateVisualization();
    updateEntitySelectors();
    updateEntityList();
    updateRelationshipList();
}

}

// ===== Enhanced Features: Themes =====
window.silentPartners.applyTheme = function(themeName) {
    console.log('Applying theme:', themeName);
    
    const themes = {
        'Lombardi Classic': {
            background: '#F9F7F4',
            nodes: {
                person: "rgba(249, 246, 238, 0.6)",
                corporation: "rgba(245, 245, 245, 0.6)",
                government: "rgba(240, 234, 214, 0.6)",
                financial: "rgba(255, 250, 240, 0.6)",
                organization: "rgba(248, 248, 255, 0.6)"
            },
            lines: {
                confirmed: "rgba(26, 26, 26, 0.85)",
                suspected: "rgba(26, 26, 26, 0.4)",
                former: "rgba(26, 26, 26, 0.25)",
                highlight: "#C41E3A"
            },
            text: '#2A2A2A',
            sidebarBg: '#FFFCF7',
            sidebarText: '#333333'
        },
        'Dark Mode': {
            background: '#1E1E1E',
            nodes: {
                person: "rgba(220, 220, 220, 0.7)",
                corporation: "rgba(180, 200, 255, 0.7)",
                government: "rgba(255, 180, 180, 0.7)",
                financial: "rgba(180, 255, 200, 0.7)",
                organization: "rgba(255, 240, 180, 0.7)"
            },
            lines: {
                confirmed: "rgba(220, 220, 220, 0.85)",
                suspected: "rgba(220, 220, 220, 0.4)",
                former: "rgba(220, 220, 220, 0.25)",
                highlight: "#FF6B6B"
            },
            text: '#E0E0E0',
            sidebarBg: '#2A2A2A',
            sidebarText: '#E0E0E0'
        },
        'Clean Minimal': {
            background: '#FFFFFF',
            nodes: {
                person: "rgba(0, 0, 0, 0.08)",
                corporation: "rgba(0, 0, 0, 0.12)",
                government: "rgba(0, 0, 0, 0.16)",
                financial: "rgba(0, 0, 0, 0.10)",
                organization: "rgba(0, 0, 0, 0.06)"
            },
            lines: {
                confirmed: "rgba(0, 0, 0, 0.7)",
                suspected: "rgba(0, 0, 0, 0.35)",
                former: "rgba(0, 0, 0, 0.18)",
                highlight: "#000000"
            },
            text: '#000000',
            sidebarBg: '#F8F8F8',
            sidebarText: '#000000'
        },
        'Corporate': {
            background: '#F5F7FA',
            nodes: {
                person: "rgba(41, 98, 255, 0.6)",
                corporation: "rgba(0, 122, 204, 0.6)",
                government: "rgba(102, 51, 153, 0.6)",
                financial: "rgba(0, 153, 76, 0.6)",
                organization: "rgba(255, 153, 0, 0.6)"
            },
            lines: {
                confirmed: "rgba(52, 73, 94, 0.85)",
                suspected: "rgba(52, 73, 94, 0.4)",
                former: "rgba(52, 73, 94, 0.25)",
                highlight: "#2962FF"
            },
            text: '#1A1A1A',
            sidebarBg: '#FFFFFF',
            sidebarText: '#1A1A1A'
        },
        'Vibrant': {
            background: '#FFFEF7',
            nodes: {
                person: "rgba(255, 87, 34, 0.7)",
                corporation: "rgba(255, 152, 0, 0.7)",
                government: "rgba(156, 39, 176, 0.7)",
                financial: "rgba(76, 175, 80, 0.7)",
                organization: "rgba(33, 150, 243, 0.7)"
            },
            lines: {
                confirmed: "rgba(33, 33, 33, 0.85)",
                suspected: "rgba(33, 33, 33, 0.4)",
                former: "rgba(33, 33, 33, 0.25)",
                highlight: "#FF5722"
            },
            text: '#212121',
            sidebarBg: '#FFFFFF',
            sidebarText: '#212121'
        }
    };
    
    const theme = themes[themeName];
    if (!theme) {
        console.error('Theme not found:', themeName);
        return;
    }
    
    // Update LOMBARDI_COLORS object directly for future renders
    LOMBARDI_COLORS.background = theme.background;
    LOMBARDI_COLORS.text = theme.text;
    Object.assign(LOMBARDI_COLORS.nodes, theme.nodes);
    Object.assign(LOMBARDI_COLORS.lines, theme.lines);
    
    // Update backgrounds
    document.body.style.backgroundColor = theme.background;
    const viz = document.getElementById('visualization');
    if (viz) viz.style.backgroundColor = theme.background;
    
    // Update sidebar
    const controls = document.getElementById('controls');
    if (controls) {
        controls.style.backgroundColor = theme.sidebarBg;
        controls.style.color = theme.sidebarText;
    }
    
    // Directly update existing SVG elements
    const svg = d3.select('#network-svg');
    
    // Update SVG background color
    svg.style('background-color', theme.background);
    
    // Update all path elements (links) - check status and apply appropriate color
    svg.selectAll('path').each(function(d) {
        const status = d && d.status ? d.status : 'confirmed';
        d3.select(this).attr('stroke', theme.lines[status]);
    });
    
    // Update all circle elements (nodes) - check type and apply appropriate color
    svg.selectAll('circle').each(function(d) {
        const type = d && d.type ? d.type : 'person';
        d3.select(this)
            .attr('fill', theme.nodes[type])
            .attr('stroke', theme.text);
    });
    
    // Update all text elements with color only (preserve font)
    svg.selectAll('text')
        .attr('fill', theme.text);
    
    // Force re-render for any new elements
    if (window.silentPartners && window.silentPartners.updateVisualization) {
        window.silentPartners.updateVisualization();
    }
    
    console.log('Theme applied successfully:', themeName);
};

// ===== Enhanced Features: Layouts =====
window.silentPartners.applyLayout = function(layoutName) {
    console.log('Applying layout:', layoutName);
    
    if (!state.simulation || !state.nodes || state.nodes.length === 0) {
        console.warn('Cannot apply layout: simulation or nodes not ready');
        return;
    }
    
    const svg = document.getElementById('network-svg');
    const width = svg ? svg.clientWidth : 1200;
    const height = svg ? svg.clientHeight : 800;
    
    // Unfix all nodes first
    state.nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
    });
    
    if (layoutName === 'Circular') {
        console.log('Applying circular layout to', state.nodes.length, 'nodes');
        const radius = Math.min(width, height) / 3;
        const angleStep = (2 * Math.PI) / state.nodes.length;
        
        state.nodes.forEach((node, i) => {
            node.fx = width/2 + radius * Math.cos(i * angleStep);
            node.fy = height/2 + radius * Math.sin(i * angleStep);
        });
    }
    else if (layoutName === 'Radial') {
        console.log('Applying radial layout');
        // Find most connected node
        const degrees = {};
        state.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            degrees[sourceId] = (degrees[sourceId] || 0) + 1;
            degrees[targetId] = (degrees[targetId] || 0) + 1;
        });
        
        const centerNode = state.nodes.reduce((max, node) => 
            (degrees[node.id] || 0) > (degrees[max.id] || 0) ? node : max
        );
        
        // Center node
        centerNode.fx = width / 2;
        centerNode.fy = height / 2;
        
        // Others in circle around it
        const others = state.nodes.filter(n => n !== centerNode);
        const radius = 250;
        const angleStep = (2 * Math.PI) / others.length;
        
        others.forEach((node, i) => {
            node.fx = centerNode.fx + radius * Math.cos(i * angleStep);
            node.fy = centerNode.fy + radius * Math.sin(i * angleStep);
        });
    }
    else if (layoutName === 'Hierarchical') {
        console.log('Applying hierarchical layout');
        // Simple top-down hierarchy
        const levels = {};
        state.nodes.forEach(node => {
            levels[node.id] = 0;
        });
        
        // Calculate levels based on connections
        state.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            levels[targetId] = Math.max(levels[targetId], levels[sourceId] + 1);
        });
        
        const maxLevel = Math.max(...Object.values(levels));
        const levelCounts = {};
        
        state.nodes.forEach(node => {
            const level = levels[node.id];
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });
        
        const levelPositions = {};
        state.nodes.forEach(node => {
            const level = levels[node.id];
            const position = levelPositions[level] || 0;
            levelPositions[level] = position + 1;
            
            node.fx = (width / (levelCounts[level] + 1)) * (position + 1);
            node.fy = (height / (maxLevel + 2)) * (level + 1);
        });
    }
    else if (layoutName === 'Timeline') {
        console.log('Applying timeline layout');
        // Sort by date if available, otherwise by name
        const sorted = [...state.nodes].sort((a, b) => {
            if (a.date && b.date) return new Date(a.date) - new Date(b.date);
            return a.name.localeCompare(b.name);
        });
        
        sorted.forEach((node, i) => {
            node.fx = (width / (state.nodes.length + 1)) * (i + 1);
            node.fy = height / 2;
        });
    }
    else {
        // Force-Directed (default) - unfix all nodes
        console.log('Applying force-directed layout (default)');
        state.nodes.forEach(node => {
            node.fx = null;
            node.fy = null;
        });
    }
    
    // Restart simulation
    state.simulation.alpha(1).restart();
    console.log('Layout applied successfully:', layoutName);
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
window.silentPartners.init();
});
