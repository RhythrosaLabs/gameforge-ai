export const DashboardTemplate = `
    <div class="tab-content" id="create">
        <section class="concept-input">
            <h2>Describe Your Game</h2>
            <div class="input-container">
                <textarea id="user-prompt" placeholder="e.g., A 2D platformer about a space-faring cat searching for the legendary Cosmic Yarnball."></textarea>
                <div class="button-group">
                    <button id="randomize-btn" class="secondary-btn">
                        <i class="fas fa-dice"></i> Randomize Concept
                    </button>
                    <button id="generate-btn" class="primary-btn">
                        <i class="fas fa-magic"></i> Generate Game Plan
                    </button>
                </div>
            </div>
        </section>

        <section class="customization">
            <h2>Customization</h2>
            <div class="customization-panel">
                <div class="panel-section">
                    <h3>Image Assets</h3>
                    <div class="asset-grid" id="image-customization">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
                <div class="panel-section">
                    <h3>Script Assets</h3>
                    <div class="asset-grid" id="script-customization">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
                <div class="panel-section">
                    <h3>Advanced Features</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-container">
                            <input type="checkbox" id="convert-3d">
                            <span class="checkmark"></span>
                            Convert Images to 3D
                            <span class="badge">Beta</span>
                        </label>
                        <label class="checkbox-container">
                            <input type="checkbox" id="generate-music">
                            <span class="checkmark"></span>
                            Generate Background Music
                            <span class="badge">Beta</span>
                        </label>
                    </div>
                </div>
            </div>
        </section>

        <section class="results" id="results-section" style="display: none;">
            <h2>Generated Game Plan</h2>
            <div class="loading-indicator" id="loading-indicator">
                <div class="spinner"></div>
                <p id="status-message">Generating game concept...</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progress-bar"></div>
                </div>
            </div>
            
            <div id="results-content" style="display: none;">
                <div class="result-tabs">
                    <button class="result-tab active" data-result="concept">Concept</button>
                    <button class="result-tab" data-result="world">World</button>
                    <button class="result-tab" data-result="characters">Characters</button>
                    <button class="result-tab" data-result="plot">Plot</button>
                    <button class="result-tab" data-result="assets">Assets</button>
                </div>
                
                <div class="result-content active" id="concept-result">
                    <h3>Game Concept</h3>
                    <div class="text-content" id="game-concept-text"></div>
                </div>
                
                <div class="result-content" id="world-result">
                    <h3>World Concept</h3>
                    <div class="text-content" id="world-concept-text"></div>
                </div>
                
                <div class="result-content" id="characters-result">
                    <h3>Character Concepts</h3>
                    <div class="text-content" id="character-concepts-text"></div>
                </div>
                
                <div class="result-content" id="plot-result">
                    <h3>Plot</h3>
                    <div class="text-content" id="plot-text"></div>
                </div>
                
                <div class="result-content" id="assets-result">
                    <h3>Generated Assets</h3>
                    <div class="assets-container">
                        <div class="asset-section">
                            <h4>Images</h4>
                            <div class="image-gallery" id="image-gallery"></div>
                        </div>
                        <div class="asset-section">
                            <h4>Scripts</h4>
                            <div class="script-list" id="script-list"></div>
                        </div>
                        <div class="asset-section" id="music-section" style="display: none;">
                            <h4>Background Music</h4>
                            <div id="music-player"></div>
                        </div>
                    </div>
                    <button id="download-btn" class="primary-btn">
                        <i class="fas fa-download"></i> Download All Assets
                    </button>
                    <button id="create-game-btn" class="primary-btn" style="margin-left: 1rem;">
                        <i class="fas fa-magic"></i> Create Game
                    </button>
                </div>
            </div>
        </section>
    </div>
`;