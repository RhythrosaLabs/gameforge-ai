import config from './config.js';
import { showNotification } from './utils.js';

// Handles all UI interactions and DOM manipulation
export class UIManager {
    constructor() {
        this.currentImageModal = null;
        this.currentCodeModal = null;
    }
    
    // Populate the customization panel
    populateCustomizationPanel(customization) {
        const imageCustomizationEl = document.getElementById('image-customization');
        const scriptCustomizationEl = document.getElementById('script-customization');
        
        // Clear existing content
        imageCustomizationEl.innerHTML = '';
        scriptCustomizationEl.innerHTML = '';
        
        // Populate image customization
        config.assetTypes.images.forEach(item => {
            const card = this.createAssetCard(
                item.type, 
                customization.imageCounts[item.type], 
                (newValue) => { customization.imageCounts[item.type] = newValue; }
            );
            imageCustomizationEl.appendChild(card);
        });
        
        // Populate script customization
        config.assetTypes.scripts.forEach(item => {
            const card = this.createAssetCard(
                item.type, 
                customization.scriptCounts[item.type], 
                (newValue) => { customization.scriptCounts[item.type] = newValue; }
            );
            scriptCustomizationEl.appendChild(card);
        });
    }
    
    createAssetCard(title, value, onChange) {
        const card = document.createElement('div');
        card.className = 'asset-card';
        
        const heading = document.createElement('h4');
        heading.textContent = title;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'number-input';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
        decreaseBtn.onclick = () => {
            if (value > 1) {
                value--;
                inputField.value = value;
                onChange(value);
            }
        };
        
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.min = '1';
        inputField.value = value;
        inputField.onchange = (e) => {
            const newValue = parseInt(e.target.value);
            if (newValue >= 1) {
                value = newValue;
                onChange(value);
            } else {
                e.target.value = value;
            }
        };
        
        const increaseBtn = document.createElement('button');
        increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
        increaseBtn.onclick = () => {
            value++;
            inputField.value = value;
            onChange(value);
        };
        
        inputContainer.appendChild(decreaseBtn);
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(increaseBtn);
        
        card.appendChild(heading);
        card.appendChild(inputContainer);
        
        return card;
    }
    
    // Theme management
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDark ? 'true' : 'false');
        this.updateThemeIcon(isDark);
    }
    
    initializeTheme() {
        if (localStorage.getItem('darkTheme') === 'true') {
            document.body.classList.add('dark-theme');
            this.updateThemeIcon(true);
        }
    }
    
    updateThemeIcon(isDark) {
        const icon = document.querySelector('.theme-toggle i');
        if (isDark) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
    
    // Modal management
    initializeModals() {
        // Image modal
        document.querySelectorAll('.close-modal').forEach(close => {
            close.addEventListener('click', () => {
                document.getElementById('image-modal').style.display = 'none';
                document.getElementById('code-modal').style.display = 'none';
            });
        });
        
        // Copy code button
        document.getElementById('copy-code').addEventListener('click', () => {
            const codeText = document.getElementById('code-content').textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                const copyBtn = document.getElementById('copy-code');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
                }, 2000);
            });
        });
    }
    
    showImageModal(imageUrl, caption) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const modalCaption = document.getElementById('modal-caption');
        
        modalImage.src = imageUrl;
        modalCaption.textContent = caption;
        modal.style.display = 'flex';
        
        this.currentImageModal = { imageUrl, caption };
    }
    
    showCodeModal(filename, code) {
        const modal = document.getElementById('code-modal');
        const modalTitle = document.getElementById('code-modal-title');
        const codeContent = document.getElementById('code-content');
        
        modalTitle.textContent = filename;
        codeContent.textContent = code;
        modal.style.display = 'flex';
        
        this.currentCodeModal = { filename, code };
    }
    
    // Display results in the UI with enhanced presentation
    displayResults(gamePlan) {
        // Hide loading indicator, show results content
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('results-content').style.display = 'block';
        
        // Populate text content with enhanced formatting
        this.displayEnhancedText('game-concept-text', gamePlan.gameConcept);
        this.displayEnhancedText('world-concept-text', gamePlan.worldConcept);
        this.displayEnhancedText('character-concepts-text', gamePlan.characterConcepts);
        this.displayEnhancedText('plot-text', gamePlan.plot);
        
        // Populate image gallery with enhanced presentation
        this.populateImageGallery(gamePlan.images);
        
        // Populate script list with enhanced info
        this.populateScriptList(gamePlan.scripts);
        
        // Show music section if music was generated
        this.handleMusicDisplay(gamePlan.music);
    }
    
    displayEnhancedText(elementId, content) {
        const element = document.getElementById(elementId);
        element.innerHTML = ''; // Clear existing content
        
        // Create formatted content with better structure
        const formattedContent = this.formatGameContent(content);
        element.appendChild(formattedContent);
    }
    
    formatGameContent(content) {
        const container = document.createElement('div');
        container.className = 'formatted-content';
        
        // Split content into sections and format
        const sections = content.split('\n\n');
        
        sections.forEach(section => {
            if (section.trim()) {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'content-section';
                
                // Check if section starts with a heading-like format
                const lines = section.split('\n');
                const firstLine = lines[0].trim();
                
                if (firstLine.endsWith(':') || firstLine.match(/^[A-Z][^.]*$/)) {
                    // This looks like a heading
                    const heading = document.createElement('h4');
                    heading.textContent = firstLine.replace(':', '');
                    heading.className = 'section-heading';
                    sectionEl.appendChild(heading);
                    
                    if (lines.length > 1) {
                        const content = document.createElement('p');
                        content.textContent = lines.slice(1).join('\n');
                        sectionEl.appendChild(content);
                    }
                } else {
                    // Regular paragraph
                    const paragraph = document.createElement('p');
                    paragraph.textContent = section;
                    sectionEl.appendChild(paragraph);
                }
                
                container.appendChild(sectionEl);
            }
        });
        
        return container;
    }
    
    populateImageGallery(images) {
        const imageGallery = document.getElementById('image-gallery');
        imageGallery.innerHTML = '';
        
        // Group images by type for better organization
        const imageGroups = {};
        for (const [key, url] of Object.entries(images)) {
            if (!key.includes('_3d_model_')) {
                const type = key.split('_')[0];
                if (!imageGroups[type]) imageGroups[type] = [];
                
                // Skip placeholder images in display
                if (url !== 'placeholder') {
                    imageGroups[type].push({ key, url });
                }
            }
        }
        
        // Create sections for each image type
        Object.entries(imageGroups).forEach(([type, imageList]) => {
            if (imageList.length > 0) {
                const typeSection = document.createElement('div');
                typeSection.className = 'image-type-section';
                
                const typeHeading = document.createElement('h4');
                typeHeading.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Assets';
                typeHeading.className = 'image-type-heading';
                typeSection.appendChild(typeHeading);
                
                const typeGrid = document.createElement('div');
                typeGrid.className = 'image-type-grid';
                
                imageList.forEach(({ key, url }) => {
                    const formattedName = key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    const imageCard = document.createElement('div');
                    imageCard.className = 'image-card enhanced';
                    imageCard.innerHTML = `
                        <div class="image-container">
                            <img src="${url}" alt="${formattedName}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'; this.alt='Image not available';">
                            <div class="image-overlay">
                                <i class="fas fa-expand"></i>
                            </div>
                        </div>
                        <div class="caption">
                            <span class="image-title">${formattedName}</span>
                            <div class="image-actions">
                                <button class="action-btn" onclick="this.parentElement.parentElement.parentElement.click()">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    imageCard.addEventListener('click', () => {
                        this.showImageModal(url, formattedName);
                    });
                    
                    typeGrid.appendChild(imageCard);
                });
                
                typeSection.appendChild(typeGrid);
                imageGallery.appendChild(typeSection);
            }
        });
    }
    
    populateScriptList(scripts) {
        const scriptList = document.getElementById('script-list');
        scriptList.innerHTML = '';
        
        // Group scripts by type for better organization
        const scriptGroups = {};
        for (const [filename, code] of Object.entries(scripts)) {
            const type = filename.split('_')[0];
            if (!scriptGroups[type]) scriptGroups[type] = [];
            scriptGroups[type].push({ filename, code });
        }
        
        // Create sections for each script type
        Object.entries(scriptGroups).forEach(([type, scriptList]) => {
            const typeSection = document.createElement('div');
            typeSection.className = 'script-type-section';
            
            const typeHeading = document.createElement('h4');
            typeHeading.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Scripts';
            typeHeading.className = 'script-type-heading';
            typeSection.appendChild(typeHeading);
            
            scriptList.forEach(({ filename, code }) => {
                const scriptCard = document.createElement('div');
                scriptCard.className = 'script-card enhanced';
                
                // Get file icon based on extension
                const extension = filename.split('.').pop();
                const iconClass = extension === 'cs' ? 'fab fa-microsoft' : 'fas fa-file-code';
                
                // Get code preview (first few lines)
                const codeLines = code.split('\n').slice(0, 3);
                const codePreview = codeLines.join('\n') + (code.split('\n').length > 3 ? '\n...' : '');
                
                scriptCard.innerHTML = `
                    <div class="script-header">
                        <i class="${iconClass}"></i>
                        <span class="script-filename">${filename}</span>
                        <span class="script-size">${code.length} chars</span>
                    </div>
                    <div class="script-preview">
                        <pre><code>${codePreview}</code></pre>
                    </div>
                    <div class="script-actions">
                        <button class="action-btn primary">
                            <i class="fas fa-eye"></i> View Full Code
                        </button>
                    </div>
                `;
                
                scriptCard.addEventListener('click', () => {
                    this.showCodeModal(filename, code);
                });
                
                typeSection.appendChild(scriptCard);
            });
            
            scriptList.appendChild(typeSection);
        });
    }
    
    handleMusicDisplay(music) {
        if (music) {
            document.getElementById('music-section').style.display = 'block';
            
            let musicPlayerHTML = '';
            
            if (typeof music === 'object') {
                // Multiple music tracks
                for (const [trackName, trackUrl] of Object.entries(music)) {
                    const formattedName = trackName.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    musicPlayerHTML += `
                        <div class="music-track">
                            <h5>${formattedName}</h5>
                            <audio controls>
                                <source src="${trackUrl}" type="audio/mp3">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    `;
                }
            } else {
                // Single music track
                musicPlayerHTML = `
                    <audio controls>
                        <source src="${music}" type="audio/mp3">
                        Your browser does not support the audio element.
                    </audio>
                `;
            }
            
            document.getElementById('music-player').innerHTML = musicPlayerHTML;
        } else {
            document.getElementById('music-section').style.display = 'none';
        }
    }
}