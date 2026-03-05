import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { TextureService } from './texture-service.js';
import { ObjectFactory } from './object-factory.js';

// Utility class for handling procedural world generation and AI textures
export class WorldGenerator {
    constructor(worldCreator) {
        this.worldCreator = worldCreator;
        this.scene = worldCreator.scene;
        this.worldObjects = worldCreator.worldObjects;
        this.worldSettings = worldCreator.worldSettings;
        this.textureCache = new Map();
        this.stableDiffusionKey = worldCreator.stableDiffusionKey;
        this.isGeneratingTextures = false;
        this.textureSetsByType = {
            ground: null,
            building: [],
            trunk: null,
            leaves: null,
            crystal: null,
            prism: null
        };
        this.textureService = new TextureService(worldCreator.stableDiffusionKey, this.textureCache);
        this.factory = new ObjectFactory(this.textureSetsByType);
    }

    // Public method to start generation
    async generateProceduralWorld() {
        this.worldCreator.clearWorld();

        // Load textures if API key is set
        if (this.stableDiffusionKey) {
            await this.loadAITextures();
        }

        // Enhanced procedural generation
        await this.generateAdvancedBuildings();
        await this.generateAdvancedTrees();
        await this.generateAdvancedVehicles();
        await this.generateFloatingElements();
        await this.generateParticleEffects();

        console.log(`Generated advanced procedural world with ${this.worldObjects.length} objects`);
    }

    // Public method to update API key (synced from WorldCreator)
    updateApiKey(key) {
        this.stableDiffusionKey = key;
    }

    // --- Core Object Creation Utilities (moved from WorldCreator) ---

    createGround() { this.factory.createGround(this.worldSettings.worldSize, this.scene); }

    // --- AI Texture Generation and Loading (moved from WorldCreator) ---

    async loadAITextures() { await this.textureService.loadCoreTextures(this.textureSetsByType); }

    // --- Procedural Generation Logic (Advanced, moved from WorldCreator) ---

    async generateAdvancedBuildings() { await this.factory.spawnAdvancedBuildings(this.scene, this.worldObjects, this.worldSettings); }

    async generateAdvancedTrees() { await this.factory.spawnAdvancedTrees(this.scene, this.worldObjects, this.worldSettings); }

    async generateAdvancedVehicles() { await this.factory.spawnAdvancedVehicles(this.scene, this.worldObjects, this.worldSettings); }

    async generateFloatingElements() { await this.factory.spawnFloatingElements(this.scene, this.worldCreator.floatingObjects, this.worldObjects, this.worldSettings); }

    async generateParticleEffects() { this.factory.spawnParticleEffects(this.scene, this.worldObjects, this.worldSettings); }
}