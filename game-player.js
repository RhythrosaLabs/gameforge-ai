import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
// import { PlayerController } from './player-controller.js';
import { GameTerrain } from './game-terrain.js';

export class GamePlayer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.worldData = null;
        this.gameState = 'stopped';
        this.score = 0;
        this.level = 1;
        this.health = 100;
        this.isInitialized = false;
        
        this.clock = new THREE.Clock();

        // Player controller instance
        this.playerController = null;
        
        // 2D player state
        this.player = null;
        this.playerVelocity = new THREE.Vector3();
        this.gravity = -30;
        this.jumpForce = 12;
        this.moveSpeed = 8;
        this.onGround = false;
        this.platforms = [];
        this.moveLeft = false;
        this.moveRight = false;

        // Terrain manager data/instance
        this.stableDiffusionKey = localStorage.getItem('stableDiffusionKey') || '';
        this.textureCache = new Map();
        this.textureSetsByType = {
            ground: null,
            building: [],
            trunk: null,
            leaves: null,
            skybox: null,
            crystal: null,
            prism: null
        };
        this.gameTerrain = null;
        
        // Chunk tracking
        this.currentChunkX = 0;
        this.currentChunkZ = 0;
        
        this.backgroundMesh = null;
        this.billboards = [];
    }

    initialize() {
        if (this.isInitialized) return;

        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        // Initialize Three.js scene for gameplay
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = null; // No fog for 2D

        // Setup orthographic camera for 2D gameplay
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const frustumSize = 20;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, 
            frustumSize * aspect / 2, 
            frustumSize / 2, 
            frustumSize / -2, 
            1, 
            1000 
        );
        this.camera.position.set(0, 0, 10);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Setup lighting
        this.setupLighting();
        
        // Initialize modules
        this.playerController = null; // Removed 3D controller
        this.gameTerrain = new GameTerrain(this.scene, this.textureSetsByType, this.stableDiffusionKey, this.textureCache);

        // Setup controls
        this.setupControls();

        // Start render loop
        this.animate();

        this.isInitialized = true;
        this.setupEventListeners();
    }

    setupLighting() {
        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        this.scene.add(hemiLight);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    loadWorldData(worldData) {
        this.worldData = worldData;
        // buildGameWorld is now only for 3D view from World Creator.
        // buildImmediatePlayableGame is for 2D game.
        // For now, let's keep buildGameWorld simple as it seems unused for the playable part.
        this.buildGameWorld();
    }

    buildGameWorld() {
        // This function is for loading the 3D world from the world creator.
        // The new 2D playable game is built by buildImmediatePlayableGame.
        // We'll clear the scene to avoid mixing 2D and 3D.
        this.clearScene();
        
        // Apply a proper 2D background if available, otherwise a neutral fallback
        const bgUrl = this.worldData?.backgroundUrl;
        if (bgUrl) {
            this.applyBackground(bgUrl);
        } else {
            // Fallback neutral backdrop plane
            const aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
            const frustumHeight = this.camera.top - this.camera.bottom;
            const frustumWidth = frustumHeight * aspect;
            const mat = new THREE.MeshBasicMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
            const geom = new THREE.PlaneGeometry(frustumWidth, frustumHeight);
            const fallbackBG = new THREE.Mesh(geom, mat);
            fallbackBG.position.set(0, 0, -50);
            fallbackBG.renderOrder = -1;
            this.backgroundMesh = fallbackBG;
            this.scene.add(this.backgroundMesh);
        }
    }

    createWorldObject(objData) {
        // This function is for the 3D world editor view, not the 2D game
        const { position, rotation, scale, userData } = objData;
        
        let geometry, material;
        
        switch (userData.type) {
            case 'building':
                // Note: The scale here is based on the WorldCreator's initial object creation parameters, 
                // so we use simple BoxGeometry. The scale array stored in userData reflects editor transformations.
                geometry = new THREE.BoxGeometry(scale[0] * 10, scale[1] * 30, scale[2] * 10);
                material = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color(0.7, 0.7, 0.7)
                });
                break;
                
            case 'tree':
                const group = new THREE.Group();
                
                // Trunk (using simplified placeholder dimensions for consistency)
                const trunkGeometry = new THREE.CylinderGeometry(0.5, 1, 8, 8);
                const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2e2e });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                
                // Leaves
                const leavesGeometry = new THREE.SphereGeometry(4, 8, 8);
                const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = 8;
                
                group.add(trunk);
                group.add(leaves);
                group.position.fromArray(position);
                group.rotation.fromArray(rotation);
                group.scale.fromArray(scale);
                group.userData = { ...userData, isWorldObject: true };
                
                return group;
                
            case 'vehicle':
                geometry = new THREE.BoxGeometry(4, 2, 8);
                material = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color(Math.random(), Math.random(), Math.random())
                });
                break;
                
            case 'object':
            default:
                geometry = new THREE.BoxGeometry(2, 2, 2);
                material = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color(Math.random(), Math.random(), Math.random())
                });
                break;
        }
        
        if (geometry && material) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.fromArray(position);
            mesh.rotation.fromArray(rotation);
            mesh.scale.fromArray(scale);
            mesh.userData = { ...userData, isWorldObject: true };
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            return mesh;
        }
        
        return null;
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
            case 'KeyW':
            case 'ArrowUp':
            case 'Space':
                if (this.onGround) {
                    this.playerVelocity.y = this.jumpForce;
                    this.onGround = false;
                }
                break;
        }
    }
    
    onKeyUp(event) {
        switch(event.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    }

    setupControls() {
        // Setup 2D controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // General game event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') this.resetPlayerPosition();
            if (e.code === 'Escape') this.pauseGame();
        });
        
        document.addEventListener('pointerLockLost', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        });
    }

    updateMovement(deltaTime) {
        if (this.gameState !== 'playing' || !this.player) return;

        // Apply gravity
        this.playerVelocity.y += this.gravity * deltaTime;

        // Horizontal movement
        let moveDirection = 0;
        if (this.moveRight) moveDirection = 1;
        if (this.moveLeft) moveDirection = -1;
        this.playerVelocity.x = moveDirection * this.moveSpeed;
        
        this.player.position.x += this.playerVelocity.x * deltaTime;
        
        const playerBoxForCollision = new THREE.Box3().setFromObject(this.player);
        playerBoxForCollision.expandByScalar(-0.1); // Make collision box slightly smaller

        // Horizontal collision with platforms
        this.platforms.forEach(platform => {
            const platformBox = new THREE.Box3().setFromObject(platform);
            if (playerBoxForCollision.intersectsBox(platformBox)) {
                const playerCenter = this.player.position.x;
                const platformCenter = platform.position.x;
                if(this.playerVelocity.x > 0 && playerCenter < platformCenter){ // moving right
                    this.player.position.x = platform.position.x - platform.geometry.parameters.width / 2 - this.player.geometry.parameters.width / 2;
                } else if(this.playerVelocity.x < 0 && playerCenter > platformCenter){ // moving left
                    this.player.position.x = platform.position.x + platform.geometry.parameters.width / 2 + this.player.geometry.parameters.width / 2;
                }
            }
        });

        this.player.position.y += this.playerVelocity.y * deltaTime;

        this.onGround = false;

        // Vertical collision with platforms
        this.platforms.forEach(platform => {
            const playerBox = new THREE.Box3().setFromObject(this.player);
            const platformBox = new THREE.Box3().setFromObject(platform);

            if (playerBox.intersectsBox(platformBox)) {
                const prevPlayerBottom = (this.player.position.y - this.playerVelocity.y * deltaTime) - this.player.geometry.parameters.height / 2;
                const platformTop = platform.position.y + platform.geometry.parameters.height / 2;
                
                // Check if player was above platform in previous frame and is now intersecting
                if (this.playerVelocity.y <= 0 && prevPlayerBottom >= platformTop-0.1) {
                    this.player.position.y = platformTop + this.player.geometry.parameters.height / 2;
                    this.playerVelocity.y = 0;
                    this.onGround = true;
                } else if (this.playerVelocity.y > 0) { // Hitting from below
                    this.playerVelocity.y = 0;
                }
            }
        });

        // Camera follow player smoothly
        this.camera.position.x += (this.player.position.x - this.camera.position.x) * 0.1;
        this.camera.position.y += (this.player.position.y - this.camera.position.y) * 0.1;
    }

    resetPlayerPosition() {
        if (this.player && this.player.userData.startX !== undefined) {
            this.player.position.set(this.player.userData.startX, this.player.userData.startY, 0);
            this.playerVelocity.set(0, 0, 0);
        }
    }

    setupEventListeners() {
        document.getElementById('start-game-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('pause-game-btn')?.addEventListener('click', () => this.pauseGame());
        document.getElementById('restart-game-btn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    }

    startGame() {
        this.gameState = 'playing';
        this.updateUI();
        
        document.getElementById('start-game-btn').disabled = true;
        document.getElementById('pause-game-btn').disabled = false;
        
        // Request pointer lock when starting - not needed for 2D
        // this.playerController.requestPointerLock();
    }

    pauseGame() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        this.updateUI();
        
        document.getElementById('start-game-btn').disabled = this.gameState === 'playing';
        document.getElementById('pause-game-btn').disabled = this.gameState !== 'playing';
        
        // Exit pointer lock when pausing
        if (this.gameState === 'paused' && document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    restartGame() {
        this.gameState = 'stopped';
        this.score = 0;
        this.level = 1;
        this.health = 100;
        this.resetPlayerPosition();
        
        this.updateUI();
        
        document.getElementById('start-game-btn').disabled = false;
        document.getElementById('pause-game-btn').disabled = true;
        
        // Exit pointer lock
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.renderer.domElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateUI() {
        document.getElementById('game-score').textContent = `Score: ${this.score}`;
        document.getElementById('game-level').textContent = `Level: ${this.level}`;
        
        const healthFill = document.getElementById('health-fill');
        if (healthFill) {
            healthFill.style.width = `${this.health}%`;
            healthFill.style.backgroundColor = this.health > 50 ? '#10b981' : 
                                              this.health > 25 ? '#f59e0b' : '#ef4444';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        this.updateMovement(deltaTime);

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        // Face billboards toward camera is not needed in orthographic view
        // this.billboards.forEach(b=> b.lookAt(this.camera.position));
    }

    resize() {
        if (!this.renderer || !this.camera) return;

        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const aspect = width / height;
        const frustumSize = 20;

        if (this.camera.isOrthographicCamera) {
            this.camera.left = frustumSize * aspect / -2;
            this.camera.right = frustumSize * aspect / 2;
            this.camera.top = frustumSize / 2;
            this.camera.bottom = frustumSize / -2;
        }
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        // Resize background plane to fill view
        if (this.backgroundMesh) {
            const frustumHeight = this.camera.top - this.camera.bottom;
            const frustumWidth = frustumHeight * aspect;
            this.backgroundMesh.geometry.dispose();
            this.backgroundMesh.geometry = new THREE.PlaneGeometry(frustumWidth, frustumHeight);
            this.backgroundMesh.position.set(0, 0, -50);
        }
    }

    generateInfiniteTerrain() {
       // This is for the 3D world, not needed for 2D game.
    }

    async checkChunkGeneration(force = false) {
        // This is for the 3D world, not needed for 2D game.
    }

    clearScene() {
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
        this.setupLighting();
    }

    buildImmediatePlayableGame(spec, images, assetMap, gamePlan) {
        console.log("=== BUILDING STORY-DRIVEN PLAYABLE GAME ===");
        console.log("\nGAME VISION:");
        console.log("- Core Loop:", assetMap.gameplay?.vision?.coreLoop);
        console.log("- Atmosphere:", assetMap.gameplay?.vision?.atmosphere);
        console.log("- Key Mechanics:", assetMap.gameplay?.vision?.keyMechanics?.join(', '));
        console.log("- Narrative Goals:", assetMap.gameplay?.vision?.narrativeGoals?.join(', '));
        
        this.gameState = 'stopped';
        if (!this.isInitialized) this.initialize();
        
        this.clearScene();
        this.billboards = [];
        this.platforms = [];

        // Set atmospheric background with story context
        const bgKey = spec.backgroundKey || assetMap.imagePool.background[0];
        const bgGameplay = assetMap.gameplay?.background;
        console.log("\nSETTING ENVIRONMENT:");
        console.log("- Atmosphere:", bgGameplay?.atmosphere);
        console.log("- Storytelling:", bgGameplay?.storytellingElements?.join('; '));
        if (bgKey && images[bgKey] && images[bgKey] !== 'placeholder') {
             this.applyBackground(images[bgKey]);
        }

        // Create ground platform
        const groundGeom = new THREE.BoxGeometry(100, 2, 1);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.position.set(0, -1, 0);
        this.scene.add(ground);
        this.platforms.push(ground);

        // Create story-driven platform layout
        console.log("\nCREATING LEVEL PLATFORMS:");
        console.log("- Design guidance:", assetMap.gameplay?.levelDesignGuidance?.progression);
        (spec.platforms || []).forEach((p, idx) => {
            const platformGeom = new THREE.BoxGeometry(p.width, p.height, 1);
            const platformMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const platform = new THREE.Mesh(platformGeom, platformMat);
            platform.position.set(p.x, p.y, 0);
            this.scene.add(platform);
            this.platforms.push(platform);
        });
        console.log(`- Created ${spec.platforms?.length || 0} narrative platforms`);

        // Create player with full narrative context
        const playerKey = assetMap.imagePool.character[0];
        const playerGameplay = assetMap.gameplay?.playerCharacter;
        console.log("\nCREATING PLAYER CHARACTER:");
        console.log("- Name:", playerGameplay?.name);
        console.log("- Description:", playerGameplay?.description);
        console.log("- Abilities:", playerGameplay?.abilities?.join(', '));
        console.log("- Motivations:", playerGameplay?.motivations?.join(', '));
        
        if (playerKey && assetMap.images[playerKey] && images[playerKey] && images[playerKey] !== 'placeholder') {
            const playerMeta = assetMap.images[playerKey];
            this.player = this.createBillboard(images[playerKey], playerMeta.width, playerMeta.height);
            this.player.position.set(spec.playerStart.x, spec.playerStart.y, 0.1);
            this.player.userData.startX = spec.playerStart.x;
            this.player.userData.startY = spec.playerStart.y;
            this.player.userData.gameplay = playerGameplay;
            this.scene.add(this.player);
            this.billboards.push(this.player);
            console.log(`✓ Player "${playerGameplay?.name}" created with ${playerGameplay?.abilities?.length || 0} abilities`);
        } else {
             console.warn("⚠ Player asset not found, using fallback");
             this.player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshLambertMaterial({color: 0x00ff00}));
             this.player.position.set(spec.playerStart.x, spec.playerStart.y, 0.1);
             this.player.userData.startX = spec.playerStart.x;
             this.player.userData.startY = spec.playerStart.y;
             this.scene.add(this.player);
        }

        // Place entities with full narrative integration
        console.log("\nPLACING NARRATIVE ENTITIES:");
        let enemyCount = 0, objectCount = 0;
        
        (spec.entities || []).forEach(e => {
            const parts = e.type.split('_');
            const category = parts[0];
            const indexStr = parts[1];
            const index = parseInt(indexStr, 10);
            
            if (isNaN(index)) {
                console.warn("⚠ Invalid entity type format:", e.type);
                return;
            }
            
            const entityKey = assetMap.imagePool[category]?.[index];
            const entityMeta = entityKey ? assetMap.images[entityKey] : null;
            const entityGameplay = entityMeta?.gameplay;

            if (category === 'enemy') {
                console.log(`\n  ENEMY ${enemyCount + 1}: "${entityGameplay?.name || 'Unknown'}"`);
                console.log(`  - Story Role: ${entityGameplay?.storyRole || 'antagonist'}`);
                console.log(`  - Description: ${entityGameplay?.description || 'An enemy'}`);
                console.log(`  - Behavior: ${entityGameplay?.behavior || 'patrol'}`);
                console.log(`  - Threat Level: ${entityGameplay?.threat || 'medium'}`);
                console.log(`  - Position: (${e.x}, ${e.y})`);
                enemyCount++;
            } else if (category === 'object') {
                console.log(`\n  OBJECT ${objectCount + 1}: "${entityGameplay?.name || 'Unknown'}"`);
                console.log(`  - Description: ${entityGameplay?.description || 'An object'}`);
                console.log(`  - Purpose: ${entityGameplay?.purpose || 'decoration'}`);
                console.log(`  - Narrative Significance: ${entityGameplay?.narrativeSignificance || 'none'}`);
                console.log(`  - Position: (${e.x}, ${e.y})`);
                objectCount++;
            }

            if (entityMeta && images[entityKey] && images[entityKey] !== 'placeholder') {
                const sprite = this.createBillboard(images[entityKey], entityMeta.width, entityMeta.height);
                sprite.position.set(e.x, e.y, 0);
                sprite.userData = { 
                    isWorldObject: true, 
                    type: category, 
                    collision: entityMeta.collision,
                    gameplay: entityGameplay
                };
                this.scene.add(sprite);
                this.billboards.push(sprite);
                console.log(`  ✓ Placed successfully`);
            } else {
                console.warn(`  ⚠ Asset not found for ${e.type}, using fallback`);
                const size = 1;
                const color = category === 'enemy' ? 0xff0000 : 0xffaa00;
                const mat = new THREE.MeshLambertMaterial({ color });
                const m = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
                m.position.set(e.x, e.y, 0);
                m.userData = { isWorldObject: true, type: category, gameplay: entityGameplay };
                this.scene.add(m);
            }
        });

        console.log("\n=== GAME WORLD COMPLETE ===");
        console.log(`✓ ${this.platforms.length} platforms created`);
        console.log(`✓ ${enemyCount} enemies placed (with story roles and behaviors)`);
        console.log(`✓ ${objectCount} objects placed (with narrative significance)`);
        console.log(`✓ Player "${playerGameplay?.name}" ready with abilities: ${playerGameplay?.abilities?.join(', ')}`);
        console.log(`✓ Atmosphere: ${assetMap.gameplay?.vision?.atmosphere}`);
        console.log(`✓ Core loop: ${assetMap.gameplay?.vision?.coreLoop}`);
        console.log("\nStarting playable experience that reflects the game's narrative...\n");
        
        this.startGame();
    }

    applyBackground(url) {
        // Remove previous background mesh
        if (this.backgroundMesh) {
            this.scene.remove(this.backgroundMesh);
            this.backgroundMesh = null;
        }

        const tex = new THREE.TextureLoader().load(url);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 4;
        tex.minFilter = THREE.LinearMipMapLinearFilter;
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });
        
        const aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
        const frustumHeight = this.camera.top - this.camera.bottom;
        const frustumWidth = frustumHeight * aspect;

        const geom = new THREE.PlaneGeometry(frustumWidth, frustumHeight);
        this.backgroundMesh = new THREE.Mesh(geom, mat);
        this.backgroundMesh.position.set(0, 0, -50);
        this.backgroundMesh.renderOrder = -1; // Render background first
        
        this.scene.add(this.backgroundMesh);
    }

    createBillboard(url, width=1.5, height=2) {
        console.log(`Creating billboard: url=${url.substring(0, 50)}..., size=${width}x${height}`);
        const tex = new THREE.TextureLoader().load(url, 
            (texture) => {
                console.log("Texture loaded successfully:", url.substring(0, 50));
            },
            undefined,
            (err) => {
                console.error("Texture load failed:", err);
            }
        );
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 4;
        tex.minFilter = THREE.LinearMipMapLinearFilter;
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });
        const geom = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.renderOrder = 1;
        return mesh;
    }
}