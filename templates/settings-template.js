export const SettingsTemplate = `
    <div class="tab-content" id="settings" style="display: none;">
        <section class="settings-section">
            <h2>Settings</h2>
            
            <div class="card" style="margin-bottom: 2rem;">
                <h3>API Configuration</h3>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label for="settings-openai-key">
                        OpenAI API Key
                        <span style="font-weight:400; font-size:0.85rem; color:var(--text-secondary);"> – required for AI generation</span>
                    </label>
                    <div class="input-with-icon">
                        <input type="password" id="settings-openai-key" placeholder="sk-...">
                        <button class="toggle-password toggle-openai-key" type="button">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        Powers all text and image generation (GPT-4o + DALL-E 3).
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">Get a key →</a>
                    </p>
                </div>

                <div class="form-group">
                    <label for="settings-stability-key">
                        Stability AI API Key
                        <span style="font-weight:400; font-size:0.85rem; color:var(--text-secondary);"> – optional, for world textures</span>
                    </label>
                    <div class="input-with-icon">
                        <input type="password" id="settings-stability-key" placeholder="sk-...">
                        <button class="toggle-password toggle-stability-key" type="button">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        Used for generating AI textures in world creation.
                        <a href="https://platform.stability.ai/account/keys" target="_blank" rel="noopener">Get a key →</a>
                    </p>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: 2rem;">
                <h3>Generation Defaults</h3>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settings-auto-save" checked> 
                        Auto-save generations
                    </label>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        Automatically save all generated game plans to your project library
                    </p>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settings-convert-3d"> 
                        Enable 3D conversion by default
                        <span class="badge">Beta</span>
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settings-generate-music"> 
                        Enable music generation by default
                        <span class="badge">Beta</span>
                    </label>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: 2rem;">
                <h3>Storage Management</h3>
                <div class="storage-info" id="storage-info">
                    <p><strong>Projects Saved:</strong> <span id="project-count">0</span></p>
                    <p><strong>Storage Used:</strong> <span id="storage-used">0 KB</span></p>
                </div>
                <button id="clear-all-projects" class="secondary-btn" style="margin-top: 1rem;">
                    <i class="fas fa-trash"></i> Clear All Projects
                </button>
            </div>
            
            <div class="card">
                <h3>Preferences</h3>
                <div class="form-group">
                    <label for="settings-theme">Theme</label>
                    <select id="settings-theme">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>
            
            <button id="save-settings-btn" class="primary-btn" style="margin-top: 2rem;">
                <i class="fas fa-save"></i> Save Settings
            </button>
        </section>
    </div>
`;

            
            <div class="card" style="margin-bottom: 2rem;">
                <h3>Generation Defaults</h3>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settings-auto-save" checked> 
                        Auto-save generations
                    </label>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        Automatically save all generated game plans to your project library
                    </p>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settings-convert-3d"> 
                        Enable 3D conversion by default
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settings-generate-music"> 
                        Enable music generation by default
                    </label>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: 2rem;">
                <h3>Storage Management</h3>
                <div class="storage-info" id="storage-info">
                    <p><strong>Projects Saved:</strong> <span id="project-count">0</span></p>
                    <p><strong>Storage Used:</strong> <span id="storage-used">0 KB</span></p>
                </div>
                <button id="clear-all-projects" class="secondary-btn" style="margin-top: 1rem;">
                    <i class="fas fa-trash"></i> Clear All Projects
                </button>
            </div>
            
            <div class="card">
                <h3>Preferences</h3>
                <div class="form-group">
                    <label for="settings-theme">Theme</label>
                    <select id="settings-theme">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>
            
            <button id="save-settings-btn" class="primary-btn" style="margin-top: 2rem;">
                <i class="fas fa-save"></i> Save Settings
            </button>
        </section>
    </div>
`;

