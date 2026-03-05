import { showNotification } from './utils.js';

export class ProjectSettingsManager {
    constructor(app, fileManager, uiManager) {
        this.app = app;
        this.fileManager = fileManager;
        this.uiManager = uiManager;
    }

    attachEventListeners() {
        document.getElementById('refresh-projects')?.addEventListener('click', () => {
            this.displayProjects();
        });

        document.getElementById('save-settings-btn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('clear-all-projects')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all projects? This cannot be undone.')) {
                this.fileManager.clearAllProjects();
                this.displayProjects();
                this.updateStorageInfo();
            }
        });

        // Toggle-visibility for OpenAI key
        document.querySelector('.toggle-openai-key')?.addEventListener('click', (e) => {
            const input = document.getElementById('settings-openai-key');
            const icon = e.currentTarget.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });

        // Toggle-visibility for Stability key
        document.querySelector('.toggle-stability-key')?.addEventListener('click', (e) => {
            const input = document.getElementById('settings-stability-key');
            const icon = e.currentTarget.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // --- Settings UI Logic ---

    loadSettingsUI() {
        const settings = this.fileManager.loadSettings();

        const openaiKeyInput = document.getElementById('settings-openai-key');
        if (openaiKeyInput) openaiKeyInput.value = settings.openAIKey || '';

        const stabilityKeyInput = document.getElementById('settings-stability-key');
        if (stabilityKeyInput) stabilityKeyInput.value = settings.stabilityApiKey || '';

        const autoSaveCheckbox = document.getElementById('settings-auto-save');
        if (autoSaveCheckbox) autoSaveCheckbox.checked = settings.autoSave;

        const convert3dCheckbox = document.getElementById('settings-convert-3d');
        if (convert3dCheckbox) convert3dCheckbox.checked = settings.convert3D;

        const generateMusicCheckbox = document.getElementById('settings-generate-music');
        if (generateMusicCheckbox) generateMusicCheckbox.checked = settings.generateMusic;

        const themeSelect = document.getElementById('settings-theme');
        if (themeSelect) themeSelect.value = settings.theme;

        this.updateStorageInfo();
    }

    saveSettings() {
        const openaiKeyInput = document.getElementById('settings-openai-key');
        const stabilityKeyInput = document.getElementById('settings-stability-key');
        const autoSaveCheckbox = document.getElementById('settings-auto-save');
        const convert3dCheckbox = document.getElementById('settings-convert-3d');
        const generateMusicCheckbox = document.getElementById('settings-generate-music');
        const themeSelect = document.getElementById('settings-theme');

        const settings = {
            openAIKey: openaiKeyInput ? openaiKeyInput.value.trim() : '',
            stabilityApiKey: stabilityKeyInput ? stabilityKeyInput.value.trim() : '',
            autoSave: autoSaveCheckbox ? autoSaveCheckbox.checked : true,
            convert3D: convert3dCheckbox ? convert3dCheckbox.checked : false,
            generateMusic: generateMusicCheckbox ? generateMusicCheckbox.checked : false,
            theme: themeSelect ? themeSelect.value : 'light'
        };

        if (this.fileManager.saveSettings(settings)) {
            // Propagate settings back to the main app (App.js handles applying global state)
            this.app.applySettings(settings);
            showNotification('Settings saved successfully', 'success');
        } else {
            showNotification('Failed to save settings', 'error');
        }
    }

    updateStorageInfo() {
        const stats = this.fileManager.getStorageStats();
        const projectCountEl = document.getElementById('project-count');
        const storageUsedEl = document.getElementById('storage-used');

        if (projectCountEl) projectCountEl.textContent = stats.projectCount;
        if (storageUsedEl) storageUsedEl.textContent = stats.storageUsed;
    }

    // --- Project Management UI Logic ---

    displayProjects() {
        const projects = this.fileManager.getAllProjects();
        const projectsGrid = document.getElementById('projects-grid');
        const emptyState = document.getElementById('empty-projects');

        if (!projectsGrid) return;

        if (projects.length === 0) {
            projectsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        projectsGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        projectsGrid.innerHTML = projects.reverse().map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-thumbnail">
                    ${project.thumbnail 
                        ? `<img src="${project.thumbnail}" alt="${project.name}">` 
                        : '<i class="fas fa-gamepad"></i>'
                    }
                </div>
                <div class="project-info">
                    <div class="project-name">${project.name}</div>
                    <div class="project-date">${new Date(project.createdAt).toLocaleDateString()}</div>
                    <div class="project-actions">
                        <button class="action-btn primary load-project" data-project-id="${project.id}">
                            <i class="fas fa-folder-open"></i> Load
                        </button>
                        <button class="action-btn delete-project" data-project-id="${project.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
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

    loadProject(projectId) {
        const project = this.fileManager.getProject(projectId);
        if (!project) {
            showNotification('Project not found', 'error');
            return;
        }

        // Hand off project loading to the main application
        this.app.loadProjectToDashboard(project);

        showNotification('Project loaded successfully', 'success');
    }
}