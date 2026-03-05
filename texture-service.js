export class TextureService {
    constructor(apiKey, textureCache = new Map()) {
        this.apiKey = apiKey;
        this.textureCache = textureCache;
        this.isGenerating = false;
    }

    updateApiKey(key) { this.apiKey = key; }

    async loadCoreTextures(textureSetsByType) {
        if (!this.apiKey || this.isGenerating) return;
        this.isGenerating = true;
        try {
            const promises = [];

            if (!textureSetsByType.ground) {
                promises.push(this._generateTexture('concrete ground texture, urban pavement, seamless', 1024, 1024)
                    .then(tex => { textureSetsByType.ground = tex; }));
            }
            if (!textureSetsByType.trunk) {
                promises.push(this._generateTexture('tree bark texture, detailed wood surface, seamless', 512, 512)
                    .then(tex => { textureSetsByType.trunk = tex; }));
            }
            if (!textureSetsByType.leaves) {
                promises.push(this._generateTexture('dense green foliage texture, leaves and branches, seamless', 512, 512)
                    .then(tex => { textureSetsByType.leaves = tex; }));
            }
            if (!textureSetsByType.building || textureSetsByType.building.length === 0) {
                promises.push(Promise.all([
                    this._generateTexture('futuristic building facade, architectural detail, seamless', 1024, 1024),
                    this._generateTexture('modern glass building texture, reflective surface, seamless', 1024, 1024),
                    this._generateTexture('industrial building texture, metal and concrete, seamless', 1024, 1024),
                ]).then(textures => {
                    textureSetsByType.building = textures.filter(Boolean);
                }));
            }

            await Promise.allSettled(promises);
        } finally {
            this.isGenerating = false;
        }
    }

    async loadGameplayTextures(textureSetsByType) {
        if (!this.apiKey || this.isGenerating) return;
        this.isGenerating = true;
        try {
            if (!textureSetsByType.ground) {
                textureSetsByType.ground = await this._generateTexture(
                    'alien terrain texture with bioluminescent patterns, top down view, seamless', 1024, 1024
                );
            }
            if (!textureSetsByType.building || textureSetsByType.building.length === 0) {
                const buildingTextures = await Promise.all([
                    this._generateTexture('futuristic building facade, architectural detail, seamless', 1024, 1024),
                    this._generateTexture('modern glass building texture, reflective surface, seamless', 1024, 1024),
                    this._generateTexture('industrial building texture, metal and concrete, seamless', 1024, 1024),
                ]);
                textureSetsByType.building = buildingTextures.filter(Boolean);
            }
            if (!textureSetsByType.trunk) {
                textureSetsByType.trunk = await this._generateTexture('tree bark texture, detailed wood surface, seamless', 512, 512);
            }
            if (!textureSetsByType.leaves) {
                textureSetsByType.leaves = await this._generateTexture('dense green foliage texture, leaves and branches, seamless', 512, 512);
            }
            if (!textureSetsByType.crystal) {
                textureSetsByType.crystal = await this._generateTexture('glowing crystalline material, iridescent surface, seamless', 512, 512);
            }
        } finally {
            this.isGenerating = false;
        }
    }

    async _generateTexture(prompt, width, height) {
        const cacheKey = `${prompt}_${width}_${height}`;
        if (this.textureCache.has(cacheKey)) return this.textureCache.get(cacheKey);

        try {
            const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    text_prompts: [{ text: prompt }],
                    cfg_scale: 7,
                    height,
                    width,
                    samples: 1,
                    steps: 30,
                }),
            });

            if (!response.ok) throw new Error(`Stable Diffusion API error: ${response.statusText}`);
            const result = await response.json();
            const imageUrl = `data:image/png;base64,${result.artifacts[0].base64}`;
            const texture = await this._loadTexture(imageUrl);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            this.textureCache.set(cacheKey, texture);
            return texture;
        } catch (err) {
            console.error('Texture generation failed:', err);
            return null;
        }
    }

    async _loadTexture(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(url, resolve, undefined, reject);
        });
    }
}