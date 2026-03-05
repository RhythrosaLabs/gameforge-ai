export const PlayTemplate = `
    <div class="tab-content" id="play" style="display: none;">
        <section class="game-player">
            <div class="player-toolbar">
                <button id="start-game-btn" class="primary-btn">
                    <i class="fas fa-play"></i> Start Game
                </button>
                <button id="pause-game-btn" class="secondary-btn" disabled>
                    <i class="fas fa-pause"></i> Pause
                </button>
                <button id="restart-game-btn" class="secondary-btn">
                    <i class="fas fa-refresh"></i> Restart
                </button>
                <button id="fullscreen-btn" class="secondary-btn">
                    <i class="fas fa-expand"></i> Fullscreen
                </button>
            </div>
            
            <div class="game-viewport">
                <canvas id="game-canvas"></canvas>
                <div class="game-overlay">
                    <div class="game-ui">
                        <div class="health-bar">
                            <div class="health-fill" id="health-fill"></div>
                        </div>
                        <div class="score" id="game-score">Score: 0</div>
                        <div class="level" id="game-level">Level: 1</div>
                    </div>
                </div>
                <div class="game-controls-help">
                    <h4>Controls</h4>
                    <div class="control-info">
                        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> - Move</span>
                        <span><kbd>Space</kbd> - Jump/Action</span>
                        <span><kbd>Mouse</kbd> - Look around</span>
                        <span><kbd>ESC</kbd> - Pause</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
`;

