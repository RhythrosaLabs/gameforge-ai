export const ModalsTemplate = `
    <div class="modal" id="image-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img id="modal-image" src="" alt="Enlarged image">
            <div class="modal-caption" id="modal-caption"></div>
        </div>
    </div>

    <div class="modal" id="code-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3 id="code-modal-title"></h3>
            <pre><code id="code-content"></code></pre>
            <button id="copy-code" class="secondary-btn">
                <i class="fas fa-copy"></i> Copy Code
            </button>
        </div>
    </div>

    <div class="modal" id="api-config-modal">
        <div class="modal-content" style="max-width: 500px;">
            <span class="close-modal">&times;</span>
            <h3><i class="fas fa-key"></i> Quick API Configuration</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
                Set your OpenAI API key to enable AI generation. For persistent storage, use the
                <strong>Settings</strong> page.
            </p>
            <div class="form-group">
                <label for="openai-api-key-modal">OpenAI API Key</label>
                <div class="input-with-icon">
                    <input type="password" id="openai-api-key-modal"
                        placeholder="sk-...">
                    <button class="toggle-password-modal" type="button">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label for="stability-api-key">Stability AI API Key <span style="font-weight:400;font-size:0.85rem;">(optional – for world textures)</span></label>
                <div class="input-with-icon">
                    <input type="password" id="stability-api-key"
                        placeholder="sk-...">
                </div>
            </div>
            <div style="display:flex; gap:1rem; margin-top:1.5rem;">
                <button id="save-api-config" class="primary-btn" style="flex:1;">
                    <i class="fas fa-save"></i> Save Keys
                </button>
                <button class="close-modal secondary-btn" style="flex:1;">
                    Cancel
                </button>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 1rem; text-align: center;">
                <i class="fas fa-lock"></i> Keys are stored locally in your browser only.
            </p>
        </div>
    </div>
`;


