/**
 * Social Media Graphics Module for Silent Partners
 * Creates exceptional, viral-ready graphics for social sharing
 */

(function() {
    'use strict';
    
    // Social media platform presets
    const SOCIAL_PRESETS = {
        twitter: {
            name: 'Twitter',
            width: 1200,
            height: 675,
            aspectRatio: '16:9',
            template: 'spotlight'
        },
        instagram: {
            name: 'Instagram',
            width: 1080,
            height: 1080,
            aspectRatio: '1:1',
            template: 'split'
        },
        linkedin: {
            name: 'LinkedIn',
            width: 1200,
            height: 627,
            aspectRatio: '1.91:1',
            template: 'annotation'
        },
        story: {
            name: 'Instagram Story',
            width: 1080,
            height: 1920,
            aspectRatio: '9:16',
            template: 'vertical'
        }
    };
    
    // Template designs
    const TEMPLATES = {
        spotlight: {
            name: 'Spotlight',
            description: 'Dark edges with spotlight on center'
        },
        split: {
            name: 'Split Screen',
            description: 'Network + key facts side by side'
        },
        annotation: {
            name: 'Annotated',
            description: 'Callouts on key nodes'
        },
        clean: {
            name: 'Clean',
            description: 'Minimal design with title'
        }
    };
    
    // ======================
    // TEMPLATE RENDERERS
    // ======================
    
    function renderSpotlightTemplate(ctx, canvas, networkCanvas, options) {
        const { width, height } = canvas;
        const { title, subtitle, stats, branding } = options;
        
        // 1. Draw radial gradient background
        const gradient = ctx.createRadialGradient(
            width/2, height/2, 0,
            width/2, height/2, width/2
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.6, '#E0E0E0');
        gradient.addColorStop(1, '#1A1A1A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 2. Draw network in center
        const networkMargin = 150;
        ctx.drawImage(
            networkCanvas,
            networkMargin,
            networkMargin + 100,
            width - networkMargin * 2,
            height - networkMargin * 2 - 150
        );
        
        // 3. Draw title bar at top
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, width, 120);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title || 'Network Visualization', 50, 75);
        
        // 4. Draw stats box (if provided)
        if (stats && stats.length > 0) {
            const boxWidth = 350;
            const boxHeight = 40 + stats.length * 45;
            const boxX = width - boxWidth - 50;
            const boxY = height - boxHeight - 100;
            
            // Box background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.shadowBlur = 0;
            
            // Stats text
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 28px Arial, sans-serif';
            ctx.textAlign = 'left';
            
            stats.forEach((stat, idx) => {
                ctx.fillText(stat, boxX + 25, boxY + 45 + idx * 45);
            });
        }
        
        // 5. Draw branding footer
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, height - 70, width, 70);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(branding || 'Silent Partners', 50, height - 30);
        
        if (subtitle) {
            ctx.font = '20px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(subtitle, width - 50, height - 30);
        }
    }
    
    function renderSplitTemplate(ctx, canvas, networkCanvas, options) {
        const { width, height } = canvas;
        const { title, facts, branding } = options;
        
        // 1. White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // 2. Draw network on left (60%)
        const networkWidth = width * 0.6;
        ctx.drawImage(
            networkCanvas,
            50,
            100,
            networkWidth - 100,
            height - 200
        );
        
        // 3. Draw facts panel on right (40%)
        const panelX = networkWidth;
        const panelWidth = width - networkWidth;
        
        // Panel background
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(panelX, 0, panelWidth, height);
        
        // Title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.textAlign = 'left';
        
        // Word wrap title
        const titleWords = (title || 'Network').split(' ');
        let titleLine = '';
        let titleY = 100;
        
        titleWords.forEach(word => {
            const testLine = titleLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > panelWidth - 80) {
                ctx.fillText(titleLine, panelX + 40, titleY);
                titleLine = word + ' ';
                titleY += 50;
            } else {
                titleLine = testLine;
            }
        });
        ctx.fillText(titleLine, panelX + 40, titleY);
        
        // Facts list
        if (facts && facts.length > 0) {
            ctx.font = '28px Arial, sans-serif';
            let factY = titleY + 80;
            
            facts.forEach(fact => {
                // Bullet point
                ctx.fillStyle = '#E74C3C';
                ctx.beginPath();
                ctx.arc(panelX + 50, factY - 8, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                // Fact text
                ctx.fillStyle = '#333333';
                ctx.fillText(fact, panelX + 70, factY);
                factY += 50;
            });
        }
        
        // Branding at bottom
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText(branding || 'Silent Partners', panelX + 40, height - 40);
    }
    
    function renderAnnotationTemplate(ctx, canvas, networkCanvas, options) {
        const { width, height } = canvas;
        const { title, annotations, branding } = options;
        
        // 1. Light background
        ctx.fillStyle = '#F8F8F8';
        ctx.fillRect(0, 0, width, height);
        
        // 2. Draw network
        const margin = 100;
        ctx.drawImage(
            networkCanvas,
            margin,
            margin + 80,
            width - margin * 2,
            height - margin * 2 - 100
        );
        
        // 3. Draw title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title || 'Network Visualization', width/2, 60);
        
        // 4. Draw annotations (if provided)
        if (annotations && annotations.length > 0) {
            ctx.strokeStyle = '#E74C3C';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#E74C3C';
            ctx.font = 'bold 20px Arial, sans-serif';
            
            annotations.forEach(ann => {
                // Draw callout line
                ctx.beginPath();
                ctx.moveTo(ann.x, ann.y);
                ctx.lineTo(ann.labelX, ann.labelY);
                ctx.stroke();
                
                // Draw label box
                const labelWidth = ctx.measureText(ann.label).width + 30;
                ctx.fillRect(ann.labelX - labelWidth/2, ann.labelY - 25, labelWidth, 40);
                
                // Draw label text
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.fillText(ann.label, ann.labelX, ann.labelY + 5);
                ctx.fillStyle = '#E74C3C';
            });
        }
        
        // 5. Branding
        ctx.fillStyle = '#000000';
        ctx.font = '22px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(branding || 'Silent Partners', width/2, height - 40);
    }
    
    function renderCleanTemplate(ctx, canvas, networkCanvas, options) {
        const { width, height } = canvas;
        const { title, subtitle, branding } = options;
        
        // 1. White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // 2. Draw network
        const margin = 120;
        ctx.drawImage(
            networkCanvas,
            margin,
            margin + 100,
            width - margin * 2,
            height - margin * 2 - 150
        );
        
        // 3. Title at top
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title || 'Network Visualization', width/2, 70);
        
        // 4. Subtitle (if provided)
        if (subtitle) {
            ctx.font = '28px Arial, sans-serif';
            ctx.fillStyle = '#666666';
            ctx.fillText(subtitle, width/2, 115);
        }
        
        // 5. Minimal branding
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#999999';
        ctx.fillText(branding || 'Silent Partners', width/2, height - 35);
    }
    
    // ======================
    // MAIN EXPORT FUNCTION
    // ======================
    
    window.exportSocialGraphic = function(platform, template, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`🎨 Generating ${platform} graphic with ${template} template...`);
                
                // Get preset
                const preset = SOCIAL_PRESETS[platform];
                if (!preset) {
                    throw new Error(`Unknown platform: ${platform}`);
                }
                
                // Create canvas for network
                const networkCanvas = document.createElement('canvas');
                const networkCtx = networkCanvas.getContext('2d');
                
                // Render current network to canvas
                const svg = document.getElementById('network-svg');
                const svgData = new XMLSerializer().serializeToString(svg);
                const img = new Image();
                
                img.onload = function() {
                    // Set network canvas size
                    networkCanvas.width = img.width;
                    networkCanvas.height = img.height;
                    networkCtx.drawImage(img, 0, 0);
                    
                    // Create final canvas
                    const finalCanvas = document.createElement('canvas');
                    finalCanvas.width = preset.width;
                    finalCanvas.height = preset.height;
                    const finalCtx = finalCanvas.getContext('2d');
                    
                    // Render template
                    const templateName = template || preset.template;
                    switch(templateName) {
                        case 'spotlight':
                            renderSpotlightTemplate(finalCtx, finalCanvas, networkCanvas, options);
                            break;
                        case 'split':
                            renderSplitTemplate(finalCtx, finalCanvas, networkCanvas, options);
                            break;
                        case 'annotation':
                            renderAnnotationTemplate(finalCtx, finalCanvas, networkCanvas, options);
                            break;
                        case 'clean':
                        default:
                            renderCleanTemplate(finalCtx, finalCanvas, networkCanvas, options);
                    }
                    
                    // Convert to blob
                    finalCanvas.toBlob(blob => {
                        resolve({
                            blob,
                            canvas: finalCanvas,
                            width: preset.width,
                            height: preset.height,
                            platform: preset.name
                        });
                    }, 'image/png', 1.0);
                };
                
                img.onerror = function() {
                    reject(new Error('Failed to load network SVG'));
                };
                
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                
            } catch (error) {
                console.error('Error generating social graphic:', error);
                reject(error);
            }
        });
    };
    
    // ======================
    // UI INTEGRATION
    // ======================
    
    function createSocialShareModal() {
        // Check if modal already exists
        if (document.getElementById('social-share-modal')) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'social-share-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📱 Share on Social Media</h2>
                    <button id="social-close" class="close-button">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="social-options">
                        <h3>Choose Platform</h3>
                        <div class="platform-grid">
                            <button class="platform-btn" data-platform="twitter">
                                <span class="platform-icon">🐦</span>
                                <span class="platform-name">Twitter</span>
                                <span class="platform-size">1200×675</span>
                            </button>
                            <button class="platform-btn" data-platform="instagram">
                                <span class="platform-icon">📷</span>
                                <span class="platform-name">Instagram</span>
                                <span class="platform-size">1080×1080</span>
                            </button>
                            <button class="platform-btn" data-platform="linkedin">
                                <span class="platform-icon">💼</span>
                                <span class="platform-name">LinkedIn</span>
                                <span class="platform-size">1200×627</span>
                            </button>
                            <button class="platform-btn" data-platform="story">
                                <span class="platform-icon">📱</span>
                                <span class="platform-name">Story</span>
                                <span class="platform-size">1080×1920</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="template-options">
                        <h3>Choose Template</h3>
                        <div class="template-grid">
                            <button class="template-btn" data-template="spotlight">Spotlight</button>
                            <button class="template-btn" data-template="split">Split Screen</button>
                            <button class="template-btn" data-template="annotation">Annotated</button>
                            <button class="template-btn" data-template="clean">Clean</button>
                        </div>
                    </div>
                    
                    <div class="social-form">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="social-title" placeholder="Enter title">
                        </div>
                        <div class="form-group">
                            <label>Subtitle (optional)</label>
                            <input type="text" id="social-subtitle" placeholder="Enter subtitle">
                        </div>
                    </div>
                    
                    <div class="social-preview">
                        <h3>Preview</h3>
                        <canvas id="social-preview-canvas"></canvas>
                    </div>
                    
                    <div class="social-actions">
                        <button id="generate-social" class="primary-btn">Generate</button>
                        <button id="download-social" class="secondary-btn" disabled>Download</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        let selectedPlatform = 'twitter';
        let selectedTemplate = 'spotlight';
        let generatedBlob = null;
        
        // Platform selection
        modal.querySelectorAll('.platform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedPlatform = btn.dataset.platform;
            });
        });
        
        // Template selection
        modal.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.template-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTemplate = btn.dataset.template;
            });
        });
        
        // Generate button
        document.getElementById('generate-social').addEventListener('click', async () => {
            const title = document.getElementById('social-title').value || 'Network Visualization';
            const subtitle = document.getElementById('social-subtitle').value;
            
            // Get network stats
            const nodeCount = window.nodes ? window.nodes.length : 0;
            const linkCount = window.links ? window.links.length : 0;
            
            const options = {
                title,
                subtitle,
                branding: 'Silent Partners',
                stats: [
                    `${nodeCount} Entities`,
                    `${linkCount} Connections`
                ],
                facts: [
                    `${nodeCount} entities`,
                    `${linkCount} relationships`,
                    'Investigative network'
                ]
            };
            
            try {
                const result = await exportSocialGraphic(selectedPlatform, selectedTemplate, options);
                generatedBlob = result.blob;
                
                // Show preview
                const previewCanvas = document.getElementById('social-preview-canvas');
                const previewCtx = previewCanvas.getContext('2d');
                previewCanvas.width = result.width / 4;
                previewCanvas.height = result.height / 4;
                previewCtx.drawImage(result.canvas, 0, 0, previewCanvas.width, previewCanvas.height);
                
                // Enable download
                document.getElementById('download-social').disabled = false;
                
                alert('✅ Graphic generated! Click Download to save.');
            } catch (error) {
                alert('Error generating graphic: ' + error.message);
            }
        });
        
        // Download button
        document.getElementById('download-social').addEventListener('click', () => {
            if (generatedBlob) {
                const url = URL.createObjectURL(generatedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `silent-partners-${selectedPlatform}-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
        
        // Close button
        document.getElementById('social-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Select first options by default
        modal.querySelector('.platform-btn').classList.add('selected');
        modal.querySelector('.template-btn').classList.add('selected');
    }
    
    function addSocialShareButton() {
        // Check if button already exists
        if (document.getElementById('social-share-btn')) {
            return;
        }
        
        // Find the enhanced features section
        const enhancedSection = document.querySelector('.control-section h3');
        if (!enhancedSection || !enhancedSection.textContent.includes('Enhanced Features')) {
            console.warn('Enhanced features section not found');
            return;
        }
        
        // Add button after export button
        const exportBtn = document.getElementById('export-btn') || document.querySelector('button[id*="export"]');
        if (exportBtn && exportBtn.parentElement) {
            const socialBtn = document.createElement('button');
            socialBtn.id = 'social-share-btn';
            socialBtn.textContent = '📱 Social Media';
            socialBtn.style.marginTop = '10px';
            socialBtn.addEventListener('click', () => {
                const modal = document.getElementById('social-share-modal');
                if (modal) {
                    modal.style.display = 'flex';
                }
            });
            exportBtn.parentElement.appendChild(socialBtn);
        }
        
        console.log('✅ Social share button added');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                createSocialShareModal();
                addSocialShareButton();
            }, 2000);
        });
    } else {
        setTimeout(() => {
            createSocialShareModal();
            addSocialShareButton();
        }, 2000);
    }
    
    console.log('📱 Social Graphics module loaded');
    
})();
