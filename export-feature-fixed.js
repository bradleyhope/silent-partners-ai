/**
 * Export Feature for Silent Partners - FIXED VERSION
 * Properly handles PNG and SVG export with style inlining
 */

(function() {
    'use strict';
    
    console.log('🖼️ Export feature (FIXED) loading...');
    
    // Helper: Get all computed styles for an element and inline them
    function inlineStyles(element) {
        const computedStyle = window.getComputedStyle(element);
        const styleString = Array.from(computedStyle).reduce((str, property) => {
            return `${str}${property}:${computedStyle.getPropertyValue(property)};`;
        }, '');
        element.setAttribute('style', styleString);
    }
    
    // Helper: Recursively inline styles for all elements
    function inlineAllStyles(element) {
        inlineStyles(element);
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            inlineAllStyles(children[i]);
        }
    }
    
    // Export as PNG using canvas with proper style inlining
    function exportAsPNG() {
        console.log('📸 Starting PNG export (FIXED)...');
        
        const svg = document.getElementById('network-svg');
        if (!svg) {
            alert('No visualization to export!');
            return;
        }
        
        try {
            // Get actual rendered dimensions from the SVG element
            const rect = svg.getBoundingClientRect();
            const width = rect.width || 1200;
            const height = rect.height || 800;
            
            console.log(`📏 SVG dimensions: ${width} x ${height}`);
            
            // Clone the SVG to avoid modifying the original
            const svgClone = svg.cloneNode(true);
            
            // Set explicit dimensions
            svgClone.setAttribute('width', width);
            svgClone.setAttribute('height', height);
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            
            // Remove viewBox to use explicit dimensions
            svgClone.removeAttribute('viewBox');
            
            // Get current background color from theme or default
            const bgColor = window.getComputedStyle(svg).backgroundColor || '#F9F7F4';
            console.log(`🎨 Background color: ${bgColor}`);
            
            // Add background rectangle to SVG
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('width', '100%');
            bgRect.setAttribute('height', '100%');
            bgRect.setAttribute('fill', bgColor);
            svgClone.insertBefore(bgRect, svgClone.firstChild);
            
            // Inline all computed styles
            console.log('🎨 Inlining styles...');
            inlineAllStyles(svgClone);
            
            // Serialize SVG to string
            const svgString = new XMLSerializer().serializeToString(svgClone);
            console.log(`📝 SVG serialized: ${svgString.length} characters`);
            
            // Create blob and object URL
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            console.log('🔗 Object URL created');
            
            // Create canvas with higher resolution for quality
            const scale = 2; // 2x for retina displays
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            
            // Scale context for high-res rendering
            ctx.scale(scale, scale);
            
            console.log(`🖼️ Canvas created: ${canvas.width} x ${canvas.height}`);
            
            // Load SVG into image
            const img = new Image();
            
            img.onload = function() {
                console.log('✅ Image loaded successfully');
                
                try {
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    console.log('✅ Image drawn to canvas');
                    
                    // Convert canvas to PNG blob
                    canvas.toBlob(function(blob) {
                        if (!blob || blob.size === 0) {
                            console.error('❌ Failed to create PNG blob');
                            alert('Failed to export PNG. The canvas conversion failed. Please try SVG export instead.');
                            URL.revokeObjectURL(url);
                            return;
                        }
                        
                        console.log(`✅ PNG blob created: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
                        
                        // Create download link
                        const link = document.createElement('a');
                        const networkTitle = document.getElementById('network-title')?.value || 'network';
                        const filename = `${networkTitle.replace(/\s+/g, '_')}_${Date.now()}.png`;
                        link.download = filename;
                        link.href = URL.createObjectURL(blob);
                        
                        // Trigger download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        console.log(`✅ PNG exported successfully: ${filename}`);
                        
                        // Cleanup URLs
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                            URL.revokeObjectURL(link.href);
                        }, 100);
                        
                    }, 'image/png', 0.95);
                    
                } catch (e) {
                    console.error('❌ Error drawing to canvas:', e);
                    alert('Failed to export PNG: ' + e.message);
                    URL.revokeObjectURL(url);
                }
            };
            
            img.onerror = function(e) {
                console.error('❌ Failed to load SVG into image:', e);
                console.error('This usually happens due to:');
                console.error('1. External resources (fonts, images) that cannot be loaded');
                console.error('2. Invalid SVG markup');
                console.error('3. Browser security restrictions');
                alert('PNG export failed. The SVG could not be converted to an image. Please use SVG export instead, which works reliably.');
                URL.revokeObjectURL(url);
            };
            
            // Set image source to trigger loading
            img.src = url;
            
        } catch (e) {
            console.error('❌ PNG export error:', e);
            console.error('Stack trace:', e.stack);
            alert('Failed to export PNG: ' + e.message + '\n\nPlease try SVG export instead.');
        }
    }
    
    // Export as SVG (this should work reliably)
    function exportAsSVG() {
        console.log('🎨 Starting SVG export...');
        
        const svg = document.getElementById('network-svg');
        if (!svg) {
            alert('No visualization to export!');
            return;
        }
        
        try {
            // Clone SVG
            const svgClone = svg.cloneNode(true);
            
            // Add XML namespace if not present
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            
            // Get dimensions
            const rect = svg.getBoundingClientRect();
            const width = rect.width || 1200;
            const height = rect.height || 800;
            
            svgClone.setAttribute('width', width);
            svgClone.setAttribute('height', height);
            
            // Get background color
            const bgColor = window.getComputedStyle(svg).backgroundColor || '#F9F7F4';
            
            // Add background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('width', '100%');
            bgRect.setAttribute('height', '100%');
            bgRect.setAttribute('fill', bgColor);
            svgClone.insertBefore(bgRect, svgClone.firstChild);
            
            // Inline styles for portability
            inlineAllStyles(svgClone);
            
            // Serialize to string
            const svgData = new XMLSerializer().serializeToString(svgClone);
            console.log(`📝 SVG serialized: ${svgData.length} characters`);
            
            // Create blob and download
            const blob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            const networkTitle = document.getElementById('network-title')?.value || 'network';
            const filename = `${networkTitle.replace(/\s+/g, '_')}_${Date.now()}.svg`;
            link.download = filename;
            link.href = url;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            console.log(`✅ SVG exported successfully: ${filename}`);
            
        } catch (e) {
            console.error('❌ SVG export error:', e);
            alert('Failed to export SVG: ' + e.message);
        }
    }
    
    // Attach event handlers to export buttons
    function attachExportHandlers() {
        const pngButton = document.getElementById('export-png-btn');
        const svgButton = document.getElementById('export-svg-btn');
        
        if (pngButton) {
            pngButton.onclick = exportAsPNG;
            console.log('✅ PNG export button handler attached');
        } else {
            console.warn('⚠️ PNG export button not found in DOM');
        }
        
        if (svgButton) {
            svgButton.onclick = exportAsSVG;
            console.log('✅ SVG export button handler attached');
        } else {
            console.warn('⚠️ SVG export button not found in DOM');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachExportHandlers);
    } else {
        attachExportHandlers();
    }
    
    // Export functions to global scope
    window.silentPartners = window.silentPartners || {};
    window.silentPartners.exportAsPNG = exportAsPNG;
    window.silentPartners.exportAsSVG = exportAsSVG;
    
    console.log('✅ Export feature (FIXED) loaded');
    
})();
