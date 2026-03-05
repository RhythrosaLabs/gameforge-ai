import config from './config.js';
import { GamePlanGenerator } from './game-plan-generator.js';
import { UIManager } from './ui-manager.js';
import { DownloadManager } from './download-manager.js';
import { FileManager } from './file-manager.js';
import { WorldCreator } from './world-creator.js';
import { GamePlayer } from './game-player.js';
import { templateLoader } from './template-loader.js';
import { showNotification } from './utils.js';
import { ProjectSettingsManager } from './project-settings-manager.js';
import { AssetAnalyzer } from './asset-analyzer.js';

// Main application class - now focused on coordination
class GameForgeApp {
    constructor() {
        this.customization = {
            imageTypes: config.assetTypes.images.map(item => item.type),
            scriptTypes: config.assetTypes.scripts.map(item => item.type),
            imageCounts: {},
            scriptCounts: {},
            useReplicate: {
                convertTo3D: config.experimentalFeatures.convert3D,
                generateMusic: config.experimentalFeatures.generateMusic
            }
        };
        
        // Initialize image and script counts from config
        config.assetTypes.images.forEach(item => {
            this.customization.imageCounts[item.type] = item.count;
        });
        
        config.assetTypes.scripts.forEach(item => {
            this.customization.scriptCounts[item.type] = item.count;
        });
        
        this.gamePlan = null;
        this.currentTab = 'create';
        
        this.gameGenerator = new GamePlanGenerator();
        this.uiManager = new UIManager();
        this.downloadManager = new DownloadManager();
        this.fileManager = new FileManager();
        this.worldCreator = new WorldCreator();
        this.gamePlayer = new GamePlayer();
        this.projectSettingsManager = new ProjectSettingsManager(this, this.fileManager, this.uiManager);
        this.assetAnalyzer = new AssetAnalyzer();
        
        this.init();
    }
    
    async init() {
        // Load templates first
        await templateLoader.initializeTemplates();
        
        // Load settings
        this.loadSettings();
        
        // Then initialize UI and attach event listeners
        this.initUI();
        this.attachEventListeners();
        
        // Display projects (handled by ProjectSettingsManager now)
        this.projectSettingsManager.displayProjects();

        // Warn if no OpenAI API key is configured
        const hasKey = localStorage.getItem('openAIKey') || this.fileManager.loadSettings().openAIKey;
        if (!hasKey) {
            setTimeout(() => {
                showNotification(
                    '⚠️ No OpenAI API key found. Go to Settings to add your key before generating.',
                    'error'
                );
            }, 800);
        }
    }
    
    // Public method for ProjectSettingsManager to apply saved settings
    applySettings(settings) {
        // Apply global state settings (API key, theme, customization flags)

        // Persist OpenAI key so api-client.js can read it
        if (settings.openAIKey) {
            localStorage.setItem('openAIKey', settings.openAIKey);
        }

        // Apply API key to generators
        this.worldCreator.stableDiffusionKey = settings.stabilityApiKey;
        this.worldCreator.worldGenerator.updateApiKey(settings.stabilityApiKey);
        this.gamePlayer.stableDiffusionKey = settings.stabilityApiKey;
        
        // Apply theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            this.uiManager.updateThemeIcon(true);
        } else {
            document.body.classList.remove('dark-theme');
            this.uiManager.updateThemeIcon(false);
        }
        
        // Apply feature flags
        this.customization.useReplicate.convertTo3D = settings.convert3D;
        this.customization.useReplicate.generateMusic = settings.generateMusic;

        // Update customization checkboxes on dashboard for consistency
        const convert3dEl = document.getElementById('convert-3d');
        const generateMusicEl = document.getElementById('generate-music');
        if (convert3dEl) convert3dEl.checked = settings.convert3D;
        if (generateMusicEl) generateMusicEl.checked = settings.generateMusic;
    }
    
    loadSettings() {
        const settings = this.fileManager.loadSettings();
        this.applySettings(settings);
    }
    
    initUI() {
        // Initialize customization UI
        this.uiManager.populateCustomizationPanel(this.customization);
        
        // Ensure checkboxes reflect current customization state, which was loaded via loadSettings()
        document.getElementById('convert-3d').checked = this.customization.useReplicate.convertTo3D;
        document.getElementById('generate-music').checked = this.customization.useReplicate.generateMusic;
    }
    
    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchTab(item.dataset.tab);
            });
        });
        
        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.uiManager.toggleTheme();
            // Note: Theme change persistence relies on saving settings in the settings tab
        });
        
        // Initialize theme from localStorage
        this.uiManager.initializeTheme();
        
        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateGamePlan();
        });
        
        // Randomize button
        document.getElementById('randomize-btn').addEventListener('click', () => {
            this.generateRandomConcept();
        });
        
        // Create Game button
        document.getElementById('create-game-btn').addEventListener('click', () => {
            this.createGame();
        });
        
        // Result tabs
        document.querySelectorAll('.result-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchResultTab(tab.dataset.result);
            });
        });
        
        // Experimental features checkboxes
        document.getElementById('convert-3d').addEventListener('change', (e) => {
            this.customization.useReplicate.convertTo3D = e.target.checked;
        });
        
        document.getElementById('generate-music').addEventListener('change', (e) => {
            this.customization.useReplicate.generateMusic = e.target.checked;
        });
        
        // Modal event listeners
        this.uiManager.initializeModals();
        
        // Download button
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadManager.downloadGamePlan(this.gamePlan);
        });

        // API Configuration Modal (simplified, as settings handles persistence)
        document.getElementById('configure-api-btn')?.addEventListener('click', () => {
            // Pre-fill current values
            const oaiModal = document.getElementById('openai-api-key-modal');
            const stabModal = document.getElementById('stability-api-key');
            if (oaiModal) oaiModal.value = localStorage.getItem('openAIKey') || '';
            if (stabModal) stabModal.value = localStorage.getItem('stableDiffusionKey') || '';
            document.getElementById('api-config-modal').style.display = 'flex';
        });

        document.getElementById('save-api-config')?.addEventListener('click', () => {
            const openaiKey = document.getElementById('openai-api-key-modal')?.value?.trim();
            const stabilityKey = document.getElementById('stability-api-key')?.value?.trim();

            if (openaiKey) {
                localStorage.setItem('openAIKey', openaiKey);
            }
            if (stabilityKey) {
                localStorage.setItem('stableDiffusionKey', stabilityKey);
                this.worldCreator.stableDiffusionKey = stabilityKey;
                this.worldCreator.worldGenerator.updateApiKey(stabilityKey);
                this.gamePlayer.stableDiffusionKey = stabilityKey;
            }

            if (openaiKey || stabilityKey) {
                document.getElementById('api-config-modal').style.display = 'none';
                this.uiManager.showNotification('API key(s) saved! Use Settings to persist across sessions.', 'success');
            } else {
                this.uiManager.showNotification('Please enter at least one API key.', 'error');
            }
        });

        // Toggle password visibility in the API config modal
        document.querySelector('.toggle-password-modal')?.addEventListener('click', (e) => {
            const input = document.getElementById('openai-api-key-modal');
            const icon = e.currentTarget.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(close => {
            close.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Custom event for switching to play mode
        document.addEventListener('switchToPlay', () => {
            this.switchTab('play');
            this.gamePlayer.loadWorldData(this.worldCreator.getWorldData());
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Attach project/settings event listeners using the new manager
        this.projectSettingsManager.attachEventListeners();
        
        // Add handlers for project actions
        document.querySelectorAll('.load-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadProject(btn.dataset.projectId);
            });
        });

        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this project?')) {
                    this.fileManager.deleteProject(btn.dataset.projectId);
                    this.displayProjects();
                    this.updateStorageInfo();
                }
            });
        });

        // Add handler for empty state button to switch tab
        document.querySelector('#empty-projects .primary-btn')?.addEventListener('click', () => {
             this.app.switchTab('create');
        });
    }
    
    switchTab(tabId) {
        // Update menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.dataset.tab === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab.id === tabId) {
                tab.style.display = 'block';
            } else {
                tab.style.display = 'none';
            }
        });
        
        // Update page title
        document.getElementById('page-title').textContent = 
            tabId === 'create' ? 'Create' :
            tabId === 'my-projects' ? 'My Projects' :
            tabId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        this.currentTab = tabId;

        // Initialize specific tab functionality
        if (tabId === 'world-creation') {
            setTimeout(() => {
                this.worldCreator.initialize();
                this.worldCreator.resize();
            }, 100);
        } else if (tabId === 'play') {
            setTimeout(() => {
                this.gamePlayer.initialize();
                this.gamePlayer.resize();
            }, 100);
        } else if (tabId === 'my-projects') {
            this.projectSettingsManager.displayProjects();
        } else if (tabId === 'settings') {
            this.projectSettingsManager.loadSettingsUI();
        }
    }
    
    switchResultTab(tabId) {
        // Update result tabs
        document.querySelectorAll('.result-tab').forEach(tab => {
            if (tab.dataset.result === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update result contents
        document.querySelectorAll('.result-content').forEach(content => {
            if (content.id === tabId + '-result') {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    async generateGamePlan() {
        const userPrompt = document.getElementById('user-prompt').value.trim();
        
        if (!userPrompt) {
            showNotification('Please enter a game concept description.', 'error');
            return;
        }
        
        // Show results section
        const resultsSection = document.getElementById('results-section');
        resultsSection.style.display = 'block';
        
        // Show loading indicator, hide results content
        document.getElementById('loading-indicator').style.display = 'flex';
        document.getElementById('results-content').style.display = 'none';
        
        try {
            // Generate game plan using the dedicated generator
            this.gamePlan = await this.gameGenerator.generateComplete(userPrompt, this.customization);
            
            // Auto-save if enabled
            const settings = this.fileManager.loadSettings();
            if (settings.autoSave) {
                this.fileManager.saveProject(this.gamePlan, userPrompt);
                this.projectSettingsManager.updateStorageInfo();
            }
            
            // Display the results
            this.displayGamePlan();
            
        } catch (error) {
            console.error("Error generating game plan:", error);
            showNotification(`Error: ${error.message}`, 'error');
            document.getElementById('loading-indicator').style.display = 'none';
        }
    }
    
    async generateRandomConcept() {
        const randomizeBtn = document.getElementById('randomize-btn');
        const originalText = randomizeBtn.innerHTML;
        
        // Show loading state
        randomizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        randomizeBtn.disabled = true;
        
        try {
            const randomConcept = await this.gameGenerator.generateRandomConcept();
            document.getElementById('user-prompt').value = randomConcept;
            showNotification('Random concept generated! Click Generate Game Plan to create your game.', 'success');
        } catch (error) {
            console.error('Error generating random concept:', error);
            showNotification('Failed to generate random concept. Please try again.', 'error');
        } finally {
            // Reset button
            randomizeBtn.innerHTML = originalText;
            randomizeBtn.disabled = false;
        }
    }

    async createGame() {
        if (!this.gamePlan) {
            showNotification('Please generate a game plan first.', 'error');
            return;
        }
        try {
            showNotification('Performing deep analysis of your game narrative and assets...', 'info');
            console.log("\n╔════════════════════════════════════════════════════════╗");
            console.log("║  DEEP GAME ANALYSIS - INTEGRATING STORY AND ASSETS   ║");
            console.log("╚════════════════════════════════════════════════════════╝\n");
            
            // Comprehensive analysis of ALL game elements
            const assetMap = await this.assetAnalyzer.analyzeAssets(this.gamePlan);
            
            console.log("\n╔════════════════════════════════════════════════════════╗");
            console.log("║     CREATING PLAYABLE GAME FROM ANALYSIS              ║");
            console.log("╚════════════════════════════════════════════════════════╝\n");
            
            showNotification('Building story-driven level with intelligent asset placement...', 'info');
            
            // Generate level spec with full narrative context
            const spec = await this.gameGenerator.generatePlayableSpec(this.gamePlan, assetMap);

            this.switchTab('play');
            setTimeout(() => {
                this.gamePlayer.initialize();
                // Build game with comprehensive narrative integration
                this.gamePlayer.buildImmediatePlayableGame(spec, this.gamePlan.images, assetMap, this.gamePlan);
                this.gamePlayer.resize();
                showNotification('Game created! All assets intelligently integrated with narrative.', 'success');
            }, 100);
        } catch (e) {
            console.error(e);
            showNotification('Failed to create playable game: ' + e.message, 'error');
        }
    }
    
    displayGamePlan() {
        this.uiManager.displayResults(this.gamePlan);
        
        // Set default tab to concept
        this.switchResultTab('concept');
    }

    handleResize() {
        if (this.currentTab === 'world-creation') {
            this.worldCreator.resize();
        } else if (this.currentTab === 'play') {
            this.gamePlayer.resize();
        }
    }
    
    // Public method for ProjectSettingsManager to call
    loadProjectToDashboard(project) {
        this.gamePlan = project.gamePlan;
        document.getElementById('user-prompt').value = project.prompt;
        
        this.switchTab('create');
        this.displayGamePlan();
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new GameForgeApp();
});