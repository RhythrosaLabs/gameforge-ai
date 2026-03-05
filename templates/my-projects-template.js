export const MyProjectsTemplate = `
    <div class="tab-content" id="my-projects" style="display: none;">
        <section class="projects-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>My Projects</h2>
                <button id="refresh-projects" class="secondary-btn">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
            
            <div class="info-box" style="margin-bottom: 2rem;">
                <i class="fas fa-info-circle"></i>
                <div>
                    <p>All your generated game plans are automatically saved here. Click on any project to view or load it.</p>
                </div>
            </div>
            
            <div id="projects-grid" class="projects-grid">
                <!-- Projects will be loaded here -->
            </div>
            
            <div id="empty-projects" class="empty-state" style="display: none;">
                <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h3>No Projects Yet</h3>
                <p>Generate your first game plan to get started!</p>
                <button class="primary-btn" data-tab="create">
                    <i class="fas fa-plus"></i> Create New Project
                </button>
            </div>
        </section>
    </div>
`;