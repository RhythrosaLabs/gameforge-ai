import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { TextureService } from './texture-service.js';
import { ObjectFactory } from './object-factory.js';

// Simple 2D Noise generator (placeholder for Perlin/Simplex)
const noise = {
    noise2D: (x, z) => {
        const hash = (x * 374761393 + z * 668265263) % 1000000;
        return ((hash % 1000) / 1000) * 2 - 1;
    }
};

export class GameTerrain {
    constructor(scene, textureSetsByType, stableDiffusionKey, textureCache) {
        this.scene = scene;
        this.textureSetsByType = textureSetsByType;
        this.stableDiffusionKey = stableDiffusionKey;
        this.textureCache = textureCache;

        this.terrain = [];
        this.buildings = [];
        this.trees = [];
        this.particles = [];
        this.floatingObjects = [];
        this.collisionObjects = [];

        this.isGeneratingTextures = false;
        this.CHUNK_SIZE = 100;
        this.MAX_DISTANCE = 2; // Keep 3x3 chunks loaded

        this.textureService = new TextureService(stableDiffusionKey, textureCache);
        this.factory = new ObjectFactory(this.textureSetsByType);
    }

    updateApiKey(key) {
        this.stableDiffusionKey = key;
    }

    // --- Chunk Management ---
    checkChunkGeneration(playerPos, currentChunkX, currentChunkZ) {
        const newChunkX = Math.floor(playerPos.x / this.CHUNK_SIZE);
        const newChunkZ = Math.floor(playerPos.z / this.CHUNK_SIZE);

        if (newChunkX !== currentChunkX || newChunkZ !== currentChunkZ) {
            this.currentChunkX = newChunkX;
            this.currentChunkZ = newChunkZ;

            this.removeDistantObjects(newChunkX, newChunkZ);
            this.generateNewChunks(newChunkX, newChunkZ);
        }
        return { currentChunkX: newChunkX, currentChunkZ: newChunkZ };
    }

    removeDistantObjects(newChunkX, newChunkZ) {
        // Filter and remove terrain chunks
        this.terrain = this.terrain.filter(chunk => {
            const dx = Math.abs(chunk.position.x / this.CHUNK_SIZE - newChunkX);
            const dz = Math.abs(chunk.position.z / this.CHUNK_SIZE - newChunkZ);
            if (dx > this.MAX_DISTANCE || dz > this.MAX_DISTANCE) {
                this.scene.remove(chunk);
                return false;
            }
            return true;
        });

        // Filter and remove procedural generated objects
        const objectLists = [this.buildings, this.trees, this.floatingObjects, this.particles];

        objectLists.forEach(list => {
            let i = list.length;
            while (i--) {
                const obj = list[i];
                if (obj.userData && obj.userData.isProcedural) {
                    const dx = Math.abs(obj.position.x / this.CHUNK_SIZE - newChunkX);
                    const dz = Math.abs(obj.position.z / this.CHUNK_SIZE - newChunkZ);
                    if (dx > this.MAX_DISTANCE || dz > this.MAX_DISTANCE) {
                        this.scene.remove(obj);
                        list.splice(i, 1);
                    }
                }
            }
        });

        // Also clean up collision objects list from procedural objects
        this.collisionObjects = this.collisionObjects.filter(obj =>
            !obj.userData.isProcedural || (
                Math.abs(obj.position.x / this.CHUNK_SIZE - newChunkX) <= this.MAX_DISTANCE &&
                Math.abs(obj.position.z / this.CHUNK_SIZE - newChunkZ) <= this.MAX_DISTANCE
            )
        );
    }

    generateNewChunks(newChunkX, newChunkZ) {
        for (let x = -this.MAX_DISTANCE; x <= this.MAX_DISTANCE; x++) {
            for (let z = -this.MAX_DISTANCE; z <= this.MAX_DISTANCE; z++) {
                const offsetX = (newChunkX + x) * this.CHUNK_SIZE;
                const offsetZ = (newChunkZ + z) * this.CHUNK_SIZE;

                if (!this.chunkExists(offsetX, offsetZ)) {
                    this.generateTerrainChunk(offsetX, offsetZ);
                    this.generateProceduralObjects(offsetX, offsetZ);
                }
            }
        }
    }

    chunkExists(offsetX, offsetZ) {
        return this.terrain.some(chunk =>
            Math.abs(chunk.position.x - offsetX) < 1 &&
            Math.abs(chunk.position.z - offsetZ) < 1
        );
    }

    // --- Procedural Generation Mesh Creation ---

    generateTerrainChunk(offsetX, offsetZ) {
        const geometry = new THREE.PlaneGeometry(this.CHUNK_SIZE, this.CHUNK_SIZE, 50, 50);
        const material = new THREE.MeshLambertMaterial({
            color: 0x2d5a27,
            wireframe: false,
            flatShading: true,
            map: this.textureSetsByType.ground
        });

        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i] + offsetX;
            const z = vertices[i + 2] + offsetZ;
            vertices[i + 1] = noise.noise2D(x * 0.05, z * 0.05) * 5; // Height based on noise
        }

        const terrainChunk = new THREE.Mesh(geometry, material);
        terrainChunk.rotation.x = -Math.PI / 2;
        terrainChunk.position.set(offsetX, 0, offsetZ);
        terrainChunk.userData = { isWorldObject: true, isProcedural: true, type: 'terrain' };

        const uvs = geometry.attributes.uv;
        for (let i = 0; i < uvs.array.length; i += 2) {
            uvs.array[i] *= 4;
            uvs.array[i + 1] *= 4;
        }

        this.scene.add(terrainChunk);
        this.terrain.push(terrainChunk);
    }

    generateProceduralObjects(offsetX, offsetZ) {
        this.generateProceduralBuildings(offsetX, offsetZ);
        this.generateProceduralTrees(offsetX, offsetZ);
        this.generateProceduralVehicles(offsetX, offsetZ);
        this.generateFloatingElements(offsetX, offsetZ);
        this.generateParticleEffects(offsetX, offsetZ);
    }

    generateProceduralBuildings(offsetX, offsetZ) {
        this.factory.spawnChunkBuildings(this.scene, this.buildings, this.collisionObjects, offsetX, offsetZ, this.CHUNK_SIZE);
    }

    generateProceduralTrees(offsetX, offsetZ) {
        this.factory.spawnChunkTrees(this.scene, this.trees, offsetX, offsetZ, this.CHUNK_SIZE);
    }

    generateProceduralVehicles(offsetX, offsetZ) {
        this.factory.spawnChunkVehicles(this.scene, this.collisionObjects, offsetX, offsetZ, this.CHUNK_SIZE);
    }

    generateFloatingElements(offsetX, offsetZ) {
        this.factory.spawnChunkFloating(this.scene, this.floatingObjects, offsetX, offsetZ, this.CHUNK_SIZE);
    }

    generateParticleEffects(offsetX, offsetZ) {
        this.factory.spawnChunkParticles(this.scene, this.particles, offsetX, offsetZ, this.CHUNK_SIZE);
    }

    createProceduralSkybox() {
        const skyboxGeometry = new THREE.SphereGeometry(800, 32, 32);
        const skyboxMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide,
            fog: false
        });

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        skybox.userData = { isWorldObject: true, type: 'skybox' };
        this.scene.add(skybox);
    }

    // --- AI Texture Loading (reused from WorldCreator/GamePlayer) ---

    async loadAITextures() {
        await this.textureService.loadGameplayTextures(this.textureSetsByType);
        this.applyTexturesToObjects();
    }

    applyTexturesToObjects() {
        // Apply ground texture to terrain chunks
        this.terrain.forEach(chunk => {
            if (this.textureSetsByType.ground) {
                chunk.material.map = this.textureSetsByType.ground;
                chunk.material.needsUpdate = true;
            }
        });

        // Apply building textures
        this.buildings.forEach(building => {
            if (this.textureSetsByType.building && Array.isArray(this.textureSetsByType.building)) {
                const randomTexture = this.textureSetsByType.building[
                    Math.floor(Math.random() * this.textureSetsByType.building.length)
                ];
                building.material.map = randomTexture;
                building.material.needsUpdate = true;
            }
        });

        // Apply tree textures
        this.trees.forEach(tree => {
            const trunk = tree.children[0];
            const leaves = tree.children[1];

            if (trunk && this.textureSetsByType.trunk) {
                trunk.material.map = this.textureSetsByType.trunk;
                trunk.material.needsUpdate = true;
            }

            if (leaves && this.textureSetsByType.leaves) {
                leaves.material.map = this.textureSetsByType.leaves;
                leaves.material.needsUpdate = true;
            }
        });

        // Apply crystal textures
        this.floatingObjects.forEach(obj => {
            if (obj.userData.type === 'crystal' && this.textureSetsByType.crystal) {
                obj.material.map = this.textureSetsByType.crystal;
                obj.material.needsUpdate = true;
            }
        });
    }

    clearAll() {
        const objectsToRemove = [];
        this.scene.traverse(child => {
            // Only remove procedural objects, or objects added by the editor if rebuilding the scene completely
            if (child.userData && (child.userData.isProcedural || child.userData.isWorldObject)) {
                objectsToRemove.push(child);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));

        this.terrain = [];
        this.buildings = [];
        this.trees = [];
        this.particles = [];
        this.floatingObjects = [];
        this.collisionObjects = [];
    }
}