export const WorldCreationTemplate = `
    <div class="tab-content" id="world-creation" style="display: none;">
        <section class="world-creator">
            <div class="creator-toolbar">
                <button id="reset-world-btn" class="secondary-btn">
                    <i class="fas fa-refresh"></i> Reset World
                </button>
                <button id="generate-terrain-btn" class="primary-btn">
                    <i class="fas fa-magic"></i> Generate Procedural World
                </button>
                <button id="place-assets-btn" class="secondary-btn">
                    <i class="fas fa-plus"></i> Place AI Assets
                </button>
                <button id="test-world-btn" class="primary-btn">
                    <i class="fas fa-play"></i> Test World
                </button>
                <button id="configure-api-btn" class="secondary-btn">
                    <i class="fas fa-cog"></i> Configure API
                </button>
            </div>
            
            <div class="world-editor">
                <div class="editor-sidebar">
                    <div class="asset-panel">
                        <h3>Generated Assets</h3>
                        <div class="asset-categories">
                            <div class="category-section">
                                <h4>Characters</h4>
                                <div id="world-characters" class="asset-list"></div>
                            </div>
                            <div class="category-section">
                                <h4>Enemies</h4>
                                <div id="world-enemies" class="asset-list"></div>
                            </div>
                            <div class="category-section">
                                <h4>Objects</h4>
                                <div id="world-objects" class="asset-list"></div>
                            </div>
                            <div class="category-section">
                                <h4>Backgrounds</h4>
                                <div id="world-backgrounds" class="asset-list"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="world-settings">
                        <h3>World Generation Settings</h3>
                        <div class="setting-group">
                            <label>World Size</label>
                            <select id="world-size">
                                <option value="small">Small (500x500)</option>
                                <option value="medium" selected>Medium (1000x1000)</option>
                                <option value="large">Large (2000x2000)</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label>Building Count</label>
                            <input type="number" id="building-count" value="30" min="10" max="100">
                        </div>
                        <div class="setting-group">
                            <label>Max Building Height</label>
                            <input type="number" id="max-height" value="150" min="50" max="300">
                        </div>
                        <div class="setting-group">
                            <label>Trees</label>
                            <input type="number" id="tree-count" value="50" min="0" max="200">
                        </div>
                        <div class="setting-group">
                            <label>Vehicles</label>
                            <input type="number" id="vehicle-count" value="20" min="0" max="100">
                        </div>
                        <div class="setting-group">
                            <label>Objects</label>
                            <input type="number" id="object-count" value="40" min="0" max="200">
                        </div>
                        <div class="setting-group">
                            <label>Lighting</label>
                            <select id="lighting-type">
                                <option value="day" selected>Day</option>
                                <option value="night">Night</option>
                                <option value="dawn">Dawn</option>
                                <option value="dusk">Dusk</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label>Use AI Textures</label>
                            <input type="checkbox" id="use-ai-textures" checked>
                        </div>
                    </div>
                </div>
                
                <div class="editor-viewport">
                    <canvas id="world-canvas"></canvas>
                    <div class="viewport-controls">
                        <div class="control-group">
                            <button id="move-tool" class="tool-btn active">
                                <i class="fas fa-arrows-alt"></i>
                            </button>
                            <button id="rotate-tool" class="tool-btn">
                                <i class="fas fa-redo"></i>
                            </button>
                            <button id="scale-tool" class="tool-btn">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </button>
                            <button id="delete-tool" class="tool-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="view-controls">
                            <button id="zoom-in" class="view-btn">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button id="zoom-out" class="view-btn">
                                <i class="fas fa-search-minus"></i>
                            </button>
                            <button id="reset-view" class="view-btn">
                                <i class="fas fa-home"></i>
                            </button>
                        </div>
                    </div>
                    <div class="controls-overlay">
                        Mouse - Rotate View | Scroll - Zoom | Click - Select Objects | AI Textures: Enhanced Quality
                    </div>
                </div>
            </div>
        </section>
        
        <!-- API Configuration Modal -->
        <div class="modal" id="api-config-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Configure API Settings</h3>
                <p>Enter your Stability AI API key to enable AI-generated textures for enhanced world quality.</p>
                <div class="form-group">
                    <label for="stability-api-key">Stability AI API Key:</label>
                    <input type="password" id="stability-api-key" placeholder="Enter your API key">
                </div>
                <button id="save-api-config" class="primary-btn">
                    <i class="fas fa-save"></i> Save Configuration
                </button>
            </div>
        </div>
    </div>
`;

