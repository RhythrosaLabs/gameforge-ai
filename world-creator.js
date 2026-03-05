import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { WorldGenerator } from './world-generator.js'; // Import the new generator

export class WorldCreator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.gameAssets = null;
        this.worldObjects = [];
        this.selectedObject = null;
        this.currentTool = 'move';
        this.isInitialized = false;
        this.worldSettings = {
            buildingCount: 30,
            worldSize: 1000,
            maxHeight: 150,
            treeCount: 50,
            vehicleCount: 20,
            objectCount: 40
        };
        
        // Add procedural generation properties
        this.stableDiffusionKey = localStorage.getItem('stableDiffusionKey') || '';
        this.floatingObjects = []; // Track objects for animation
        this.backgroundMesh = null;
        this.backgroundUrl = null;
        
        this.worldGenerator = new WorldGenerator(this);
    }

    initialize() {
        if (this.isInitialized) return;

        const canvas = document.getElementById('world-canvas');
        if (!canvas) return;

        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 500, 2000);
        
        // Update generator references
        this.worldGenerator.scene = this.scene;
        this.worldGenerator.worldObjects = this.worldObjects;
        this.worldGenerator.worldSettings = this.worldSettings;

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            5000
        );
        this.camera.position.set(0, 50, 100);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 500;
        this.controls.minDistance = 10;

        // Setup comprehensive lighting
        this.setupLighting();

        // Create initial ground plane (using generator method)
        this.worldGenerator.createGround();

        // Start render loop
        this.animate();

        this.isInitialized = true;
        this.setupEventListeners();
    }

    setupLighting() {
        // Hemisphere light for natural lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        this.scene.add(hemiLight);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(200, 300, 200);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 1000;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        this.scene.add(directionalLight);
    }

    createBuilding(width, height, depth, x, z, textureUrl = null) {
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        
        let buildingMaterial;
        if (textureUrl && textureUrl !== 'placeholder') {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(textureUrl);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 4);
            buildingMaterial = new THREE.MeshLambertMaterial({ map: texture });
        } else {
            buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color(
                    0.5 + Math.random() * 0.5,
                    0.5 + Math.random() * 0.5,
                    0.5 + Math.random() * 0.5
                )
            });
        }
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData = { type: 'building' };
        
        return building;
    }

    createGameObject(x, z, textureUrl = null) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color(Math.random(), Math.random(), Math.random())
        });
        
        if (textureUrl && textureUrl !== 'placeholder') {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(textureUrl);
            material.map = texture;
        }
        
        const object = new THREE.Mesh(geometry, material);
        object.position.set(x, 1, z);
        object.castShadow = true;
        object.receiveShadow = true;
        object.userData = { type: 'object' };
        
        return object;
    }

    async generateProceduralWorld() {
        await this.worldGenerator.generateProceduralWorld();
        // Regenerate ground in case AI texture loaded
        this.clearGround();
        this.worldGenerator.createGround();
    }

    clearWorld() {
        this.worldObjects.forEach(obj => this.scene.remove(obj));
        this.worldObjects = [];
        this.floatingObjects = [];
        this.selectedObject = null;
        this.clearGround();
    }

    clearGround() {
        const ground = this.scene.children.find(c => c.geometry?.type === 'PlaneGeometry');
        if (ground) {
            this.scene.remove(ground);
        }
    }

    loadGameAssets(gamePlan) {
        this.gameAssets = gamePlan;
        this.populateAssetPanels();
    }

    populateAssetPanels() {
        if (!this.gameAssets || !this.gameAssets.images) return;

        const categories = ['characters', 'enemies', 'objects', 'backgrounds'];
        
        categories.forEach(category => {
            const container = document.getElementById(`world-${category}`);
            if (!container) return;

            container.innerHTML = '';

            // Find assets for this category
            Object.entries(this.gameAssets.images).forEach(([key, url]) => {
                if (key.toLowerCase().includes(category.slice(0, -1)) && url !== 'placeholder') {
                    const assetItem = document.createElement('div');
                    assetItem.className = 'asset-item';
                    assetItem.innerHTML = `
                        <img src="${url}" alt="${key}" />
                        <span>${key.replace(/_/g, ' ')}</span>
                    `;
                    
                    assetItem.addEventListener('click', () => {
                        this.placeAssetInWorld(key, url);
                    });
                    
                    container.appendChild(assetItem);
                }
            });
        });
    }

    placeAssetInWorld(assetKey, assetUrl) {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        
        let newObject;
        if (assetKey.includes('character') || assetKey.includes('enemy')) {
            newObject = this.createBillboard(assetUrl, 1.5, 2.6);
            newObject.position.set(x, newObject.geometry.parameters.height/2, z);
        } else if (assetKey.includes('object')) {
            // Textured box "extrusion" for objects
            const size = 1.2;
            const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            if (assetUrl && assetUrl !== 'placeholder') {
                const tex = new THREE.TextureLoader().load(assetUrl);
                tex.encoding = THREE.sRGBEncoding;
                mat.map = tex;
            }
            newObject = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
            newObject.position.set(x, size/2, z);
        } else if (assetKey.includes('background')) {
            this.setBackground(assetUrl);
            return;
        } else {
            newObject = this.createGameObject(x, z, assetUrl);
        }

        newObject.userData.assetKey = assetKey;
        newObject.userData.assetUrl = assetUrl;
        
        this.scene.add(newObject);
        this.worldObjects.push(newObject);
    }

    createBillboard(url, width=1.5, height=2.6) {
        const tex = new THREE.TextureLoader().load(url);
        tex.encoding = THREE.sRGBEncoding;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, depthWrite: false, side: THREE.DoubleSide });
        const geom = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = { type: 'billboard' };
        return mesh;
    }

    setBackground(url) {
        this.backgroundUrl = url;
        if (this.backgroundMesh) { this.scene.remove(this.backgroundMesh); this.backgroundMesh = null; }
        if (!url || url === 'placeholder') return;
        const tex = new THREE.TextureLoader().load(url, () => { this.renderer?.render(this.scene, this.camera); });
        tex.encoding = THREE.sRGBEncoding;
        const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false });
        const geom = new THREE.SphereGeometry(600, 32, 32);
        this.backgroundMesh = new THREE.Mesh(geom, mat);
        this.backgroundMesh.userData = { isWorldObject: true, type: 'background' };
        this.scene.add(this.backgroundMesh);
    }

    setupEventListeners() {
        // Tool buttons
        document.getElementById('move-tool')?.addEventListener('click', () => this.setTool('move'));
        document.getElementById('rotate-tool')?.addEventListener('click', () => this.setTool('rotate'));
        document.getElementById('scale-tool')?.addEventListener('click', () => this.setTool('scale'));
        document.getElementById('delete-tool')?.addEventListener('click', () => this.setTool('delete'));

        // Toolbar buttons
        document.getElementById('reset-world-btn')?.addEventListener('click', () => this.resetWorld());
        document.getElementById('generate-terrain-btn')?.addEventListener('click', () => this.generateProceduralWorld());
        document.getElementById('place-assets-btn')?.addEventListener('click', () => this.autoPlaceAssets());
        document.getElementById('test-world-btn')?.addEventListener('click', () => this.testWorld());

        // View controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('reset-view')?.addEventListener('click', () => this.resetView());

        // World settings
        document.getElementById('world-size')?.addEventListener('change', (e) => {
            const sizes = { small: 500, medium: 1000, large: 2000 };
            this.worldSettings.worldSize = sizes[e.target.value] || 1000;
        });

        // Add API key configuration
        document.getElementById('building-count')?.addEventListener('change', (e) => {
            this.worldSettings.buildingCount = parseInt(e.target.value);
        });

        document.getElementById('max-height')?.addEventListener('change', (e) => {
            this.worldSettings.maxHeight = parseInt(e.target.value);
        });

        document.getElementById('tree-count')?.addEventListener('change', (e) => {
            this.worldSettings.treeCount = parseInt(e.target.value);
        });

        document.getElementById('vehicle-count')?.addEventListener('change', (e) => {
            this.worldSettings.vehicleCount = parseInt(e.target.value);
        });

        document.getElementById('object-count')?.addEventListener('change', (e) => {
            this.worldSettings.objectCount = parseInt(e.target.value);
        });

        // Mouse events for object selection
        this.renderer.domElement.addEventListener('click', (event) => {
            this.handleObjectClick(event);
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tool}-tool`)?.classList.add('active');
    }

    handleObjectClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.worldObjects);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            if (this.currentTool === 'delete') {
                this.deleteObject(object);
            } else {
                this.selectObject(object);
            }
        }
    }

    selectObject(object) {
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }
        
        this.selectedObject = object;
        if (object.material.emissive) {
            object.material.emissive.setHex(0x444444);
        }
    }

    deleteObject(object) {
        this.scene.remove(object);
        this.worldObjects = this.worldObjects.filter(obj => obj !== object);
        if (this.selectedObject === object) {
            this.selectedObject = null;
        }
    }

    resetWorld() {
        this.clearWorld();
        this.worldGenerator.createGround(); // Use generator method
    }

    autoPlaceAssets() {
        if (!this.gameAssets || !this.gameAssets.images) return;

        Object.entries(this.gameAssets.images).forEach(([key, url]) => {
            if (url !== 'placeholder') {
                this.placeAssetInWorld(key, url);
            }
        });
    }

    testWorld() {
        // Switch to play mode
        const event = new CustomEvent('switchToPlay');
        document.dispatchEvent(event);
    }

    zoomIn() {
        this.camera.position.multiplyScalar(0.9);
    }

    zoomOut() {
        this.camera.position.multiplyScalar(1.1);
    }

    resetView() {
        this.camera.position.set(0, 50, 100);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate floating objects
        const time = performance.now() * 0.001;
        this.floatingObjects.forEach((obj, index) => {
            if (obj.userData.floating) {
                obj.rotation.x += 0.01;
                obj.rotation.y += 0.005;
                obj.position.y += Math.sin(time * 2 + index) * 0.005;
            }
        });
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        if (!this.renderer || !this.camera) return;

        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    getWorldData() {
        return {
            objects: this.worldObjects.map(obj => ({
                position: obj.position.toArray(),
                rotation: obj.rotation.toArray(),
                scale: obj.scale.toArray(),
                userData: obj.userData
            })),
            settings: {
                size: this.worldSettings.worldSize,
                buildingCount: this.worldSettings.buildingCount,
                treeCount: this.worldSettings.treeCount,
                vehicleCount: this.worldSettings.vehicleCount,
                objectCount: this.worldSettings.objectCount
            },
            backgroundUrl: this.backgroundUrl || null
        };
    }
}