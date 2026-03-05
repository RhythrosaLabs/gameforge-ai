import { showNotification } from './utils.js';

export class FileManager {
    constructor() {
        this.storageKey = 'gameforge_projects';
        this.settingsKey = 'gameforge_settings';
    }

    // Save a project
    saveProject(gamePlan, userPrompt) {
        try {
            const projects = this.getAllProjects();
            
            const project = {
                id: Date.now().toString(),
                name: this.generateProjectName(userPrompt),
                prompt: userPrompt,
                gamePlan: gamePlan,
                createdAt: new Date().toISOString(),
                thumbnail: this.generateThumbnail(gamePlan)
            };
            
            projects.push(project);
            localStorage.setItem(this.storageKey, JSON.stringify(projects));
            
            showNotification(`Project "${project.name}" saved successfully!`, 'success');
            return project.id;
        } catch (error) {
            console.error('Error saving project:', error);
            showNotification('Failed to save project. Storage may be full.', 'error');
            return null;
        }
    }

    // Get all projects
    getAllProjects() {
        try {
            const projectsJson = localStorage.getItem(this.storageKey);
            return projectsJson ? JSON.parse(projectsJson) : [];
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    }

    // Get a specific project
    getProject(id) {
        const projects = this.getAllProjects();
        return projects.find(p => p.id === id);
    }

    // Delete a project
    deleteProject(id) {
        try {
            const projects = this.getAllProjects();
            const filteredProjects = projects.filter(p => p.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredProjects));
            showNotification('Project deleted successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            showNotification('Failed to delete project', 'error');
            return false;
        }
    }

    // Clear all projects
    clearAllProjects() {
        try {
            localStorage.removeItem(this.storageKey);
            showNotification('All projects cleared successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error clearing projects:', error);
            showNotification('Failed to clear projects', 'error');
            return false;
        }
    }

    // Get storage statistics
    getStorageStats() {
        const projects = this.getAllProjects();
        const projectsJson = JSON.stringify(projects);
        const bytes = new Blob([projectsJson]).size;
        
        return {
            projectCount: projects.length,
            storageUsed: this.formatBytes(bytes)
        };
    }

    // Generate a project name from the prompt
    generateProjectName(prompt) {
        const maxLength = 50;
        const name = prompt.length > maxLength 
            ? prompt.substring(0, maxLength) + '...' 
            : prompt;
        return name;
    }

    // Generate thumbnail URL from game plan
    generateThumbnail(gamePlan) {
        if (gamePlan.images) {
            const imageKeys = Object.keys(gamePlan.images);
            const characterImage = imageKeys.find(key => key.includes('character'));
            if (characterImage && gamePlan.images[characterImage] !== 'placeholder') {
                return gamePlan.images[characterImage];
            }
            
            const firstValidImage = imageKeys.find(key => gamePlan.images[key] !== 'placeholder');
            if (firstValidImage) {
                return gamePlan.images[firstValidImage];
            }
        }
        
        return null;
    }

    // Format bytes to readable string
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Settings management
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    loadSettings() {
        try {
            const settingsJson = localStorage.getItem(this.settingsKey);
            return settingsJson ? JSON.parse(settingsJson) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            openAIKey: '',
            autoSave: true,
            convert3D: false,
            generateMusic: false,
            theme: 'light',
            stabilityApiKey: ''
        };
    }
}