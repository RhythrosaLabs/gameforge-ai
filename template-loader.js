// Template loading and management utility
export class TemplateLoader {
    constructor() {
        this.templates = new Map();
        this.loadedTemplates = new Set();
    }

    // Load a template from a URL or inline definition
    async loadTemplate(name, content) {
        if (typeof content === 'string' && content.startsWith('<')) {
            // Inline HTML content
            this.templates.set(name, content);
        } else {
            // Would load from URL in a real implementation
            // For now, store inline templates
            this.templates.set(name, content);
        }
        this.loadedTemplates.add(name);
    }

    // Get a template by name
    getTemplate(name) {
        return this.templates.get(name);
    }

    // Inject a template into a container
    injectTemplate(containerSelector, templateName) {
        const container = document.querySelector(containerSelector);
        const template = this.getTemplate(templateName);
        
        if (container && template) {
            container.innerHTML = template;
        }
    }

    // Initialize all core templates
    async initializeTemplates() {
        // Load all templates from separate template definitions
        const { SidebarTemplate } = await import('./templates/sidebar-template.js');
        const { DashboardTemplate } = await import('./templates/dashboard-template.js');
        const { MyProjectsTemplate } = await import('./templates/my-projects-template.js');
        const { WorldCreationTemplate } = await import('./templates/world-creation-template.js');
        const { PlayTemplate } = await import('./templates/play-template.js');
        const { SettingsTemplate } = await import('./templates/settings-template.js');
        const { AboutTemplate } = await import('./templates/about-template.js');
        const { ModalsTemplate } = await import('./templates/modals-template.js');

        // Load each template
        await this.loadTemplate('sidebar', SidebarTemplate);
        await this.loadTemplate('create', DashboardTemplate);
        await this.loadTemplate('my-projects', MyProjectsTemplate);
        await this.loadTemplate('world-creation', WorldCreationTemplate);
        await this.loadTemplate('play', PlayTemplate);
        await this.loadTemplate('settings', SettingsTemplate);
        await this.loadTemplate('about', AboutTemplate);
        await this.loadTemplate('modals', ModalsTemplate);

        // Inject all templates
        this.injectTemplate('#sidebar-container', 'sidebar');
        this.injectTemplate('#modal-container', 'modals');
        
        // Create tab container content
        const tabContainer = document.getElementById('tab-container');
        tabContainer.innerHTML = 
            this.getTemplate('create') +
            this.getTemplate('my-projects') +
            this.getTemplate('world-creation') +
            this.getTemplate('play') +
            this.getTemplate('settings') +
            this.getTemplate('about');
    }
}

// Export singleton instance
export const templateLoader = new TemplateLoader();