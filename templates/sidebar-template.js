export const SidebarTemplate = `
    <div class="logo">
        <svg width="40" height="40" viewBox="0 0 40 40">
            <path d="M20 5L5 20L20 35L35 20L20 5Z" fill="#6366f1" />
            <path d="M20 10L10 20L20 30L30 20L20 10Z" fill="#818cf8" />
            <circle cx="20" cy="20" r="5" fill="#c7d2fe" />
        </svg>
        <h1>GameForge AI</h1>
    </div>
    <div class="menu">
        <button class="menu-item active" data-tab="create">
            <i class="fas fa-magic"></i>
            <span>Create</span>
        </button>
        <button class="menu-item" data-tab="my-projects">
            <i class="fas fa-folder"></i>
            <span>My Projects</span>
        </button>
        <button class="menu-item" data-tab="world-creation">
            <i class="fas fa-globe"></i>
            <span>World Creation</span>
        </button>
        <button class="menu-item" data-tab="play">
            <i class="fas fa-play"></i>
            <span>Play</span>
        </button>
        <button class="menu-item" data-tab="settings">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
        </button>
        <button class="menu-item" data-tab="about">
            <i class="fas fa-info-circle"></i>
            <span>About</span>
        </button>
    </div>
    <div class="sidebar-footer">
        <p>Powered by AI</p>
        <p>Created by Rhythrosa Labs</p>
    </div>
`;