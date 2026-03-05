import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class ObjectFactory {
    constructor(textureSetsByType) {
        this.tex = textureSetsByType;
    }

    createGround(size, scene) {
        const groundGeometry = new THREE.PlaneGeometry(size, size);
        const groundMaterial = new THREE.MeshLambertMaterial({
            map: this.tex.ground || null,
            color: this.tex.ground ? 0xffffff : 0x3c3c3c,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        return ground;
    }

    // WorldCreator (advanced) spawners
    async spawnAdvancedBuildings(scene, worldObjects, settings) {
        const variants = [
            { width: 15, height: 80, depth: 15 },
            { width: 25, height: 40, depth: 20 },
            { width: 30, height: 25, depth: 30 },
            { width: 12, height: 60, depth: 12 },
            { width: 40, height: 15, depth: 25 }
        ];
        for (let i = 0; i < settings.buildingCount; i++) {
            const v = variants[Math.floor(Math.random() * variants.length)];
            const mesh = this._buildBuildingMesh(v.width, v.height, v.depth);
            const x = (Math.random() - 0.5) * settings.worldSize * 0.8;
            const z = (Math.random() - 0.5) * settings.worldSize * 0.8;
            mesh.position.set(x, v.height / 2, z);
            scene.add(mesh);
            worldObjects.push(mesh);
        }
    }

    async spawnAdvancedTrees(scene, worldObjects, settings) {
        const variants = [
            { trunkHeight: 8, trunkRadius: 0.8, crownRadius: 4 },
            { trunkHeight: 12, trunkRadius: 1.2, crownRadius: 6 },
            { trunkHeight: 6, trunkRadius: 0.5, crownRadius: 3 },
            { trunkHeight: 15, trunkRadius: 1.5, crownRadius: 8 }
        ];
        for (let i = 0; i < settings.treeCount; i++) {
            const v = variants[Math.floor(Math.random() * variants.length)];
            const tree = this._buildTreeGroup(v.trunkHeight, v.trunkRadius, v.crownRadius);
            const x = (Math.random() - 0.5) * settings.worldSize * 0.9;
            const z = (Math.random() - 0.5) * settings.worldSize * 0.9;
            tree.position.set(x, 0, z);
            scene.add(tree);
            worldObjects.push(tree);
        }
    }

    async spawnAdvancedVehicles(scene, worldObjects, settings) {
        const types = ['car', 'bus', 'truck', 'van'];
        for (let i = 0; i < settings.vehicleCount; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const vehicle = this._buildVehicle(type);
            const x = (Math.random() - 0.5) * settings.worldSize * 0.7;
            const z = (Math.random() - 0.5) * settings.worldSize * 0.7;
            vehicle.position.set(x, 0, z);
            vehicle.rotation.y = Math.random() * Math.PI * 2;
            scene.add(vehicle);
            worldObjects.push(vehicle);
        }
    }

    async spawnFloatingElements(scene, floatingRegistry, worldObjects, settings) {
        for (let i = 0; i < 10; i++) {
            const crystal = this._buildCrystal();
            crystal.position.set(
                (Math.random() - 0.5) * settings.worldSize * 0.8,
                5 + Math.random() * 15,
                (Math.random() - 0.5) * settings.worldSize * 0.8
            );
            scene.add(crystal);
            worldObjects.push(crystal);
            floatingRegistry.push(crystal);
        }
        for (let i = 0; i < 5; i++) {
            const prism = this._buildPrism();
            prism.position.set(
                (Math.random() - 0.5) * settings.worldSize * 0.8,
                8 + Math.random() * 12,
                (Math.random() - 0.5) * settings.worldSize * 0.8
            );
            scene.add(prism);
            worldObjects.push(prism);
            floatingRegistry.push(prism);
        }
    }

    spawnParticleEffects(scene, worldObjects, settings) {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * settings.worldSize;
            positions[i + 1] = Math.random() * 50;
            positions[i + 2] = (Math.random() - 0.5) * settings.worldSize;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        particleSystem.userData = { type: 'particles' };
        scene.add(particleSystem);
        worldObjects.push(particleSystem);
    }

    // GameTerrain chunk spawners
    spawnChunkBuildings(scene, buildingsList, collisionList, offsetX, offsetZ, CHUNK) {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const width = 5 + Math.random() * 20;
            const height = 10 + Math.random() * 80;
            const depth = 5 + Math.random() * 20;
            const b = this._buildBuildingMesh(width, height, depth);
            const x = (Math.random() * CHUNK - CHUNK / 2) + offsetX;
            const z = (Math.random() * CHUNK - CHUNK / 2) + offsetZ;
            b.position.set(x, height / 2, z);
            b.userData = { isWorldObject: true, isProcedural: true, type: 'building' };
            scene.add(b);
            buildingsList.push(b);
            collisionList.push(b);
        }
    }

    spawnChunkTrees(scene, treesList, offsetX, offsetZ, CHUNK) {
        const count = 8 + Math.floor(Math.random() * 12);
        for (let i = 0; i < count; i++) {
            const trunkHeight = 4 + Math.random() * 8;
            const trunkRadius = 0.3 + Math.random() * 0.5;
            const crownRadius = 2 + Math.random() * 3;
            const t = this._buildTreeGroup(trunkHeight, trunkRadius, crownRadius);
            const x = (Math.random() * CHUNK - CHUNK / 2) + offsetX;
            const z = (Math.random() * CHUNK - CHUNK / 2) + offsetZ;
            t.position.set(x, 0, z);
            t.userData = { isWorldObject: true, isProcedural: true, type: 'tree' };
            scene.add(t);
            treesList.push(t);
        }
    }

    spawnChunkVehicles(scene, collisionList, offsetX, offsetZ, CHUNK) {
        const count = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            const type = ['car', 'bus', 'truck'][Math.floor(Math.random() * 3)];
            const v = this._buildVehicle(type);
            const x = (Math.random() * CHUNK - CHUNK / 2) + offsetX;
            const z = (Math.random() * CHUNK - CHUNK / 2) + offsetZ;
            v.position.set(x, 0, z);
            v.rotation.y = Math.random() * Math.PI * 2;
            v.userData = { isWorldObject: true, isProcedural: true, type: 'vehicle' };
            scene.add(v);
            collisionList.push(v);
        }
    }

    spawnChunkFloating(scene, floatingList, offsetX, offsetZ, CHUNK) {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const c = this._buildCrystal();
            const x = (Math.random() * CHUNK - CHUNK / 2) + offsetX;
            const y = 5 + Math.random() * 15;
            const z = (Math.random() * CHUNK - CHUNK / 2) + offsetZ;
            c.position.set(x, y, z);
            c.userData = { isWorldObject: true, isProcedural: true, type: 'crystal', floating: true };
            scene.add(c);
            floatingList.push(c);
        }
    }

    spawnChunkParticles(scene, particlesList, offsetX, offsetZ, CHUNK) {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() * CHUNK - CHUNK / 2) + offsetX;
            positions[i + 1] = Math.random() * 20;
            positions[i + 2] = (Math.random() * CHUNK - CHUNK / 2) + offsetZ;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.6 });
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        particleSystem.userData = { isWorldObject: true, isProcedural: true, type: 'particles' };
        scene.add(particleSystem);
        particlesList.push(particleSystem);
        if (particlesList.length > 9) {
            const old = particlesList.shift();
            scene.remove(old);
        }
    }

    // Internals
    _buildBuildingMesh(width, height, depth) {
        const geom = new THREE.BoxGeometry(width, height, depth);
        let mat;
        if (this.tex.building?.length) {
            const t = this.tex.building[Math.floor(Math.random() * this.tex.building.length)];
            t.repeat.set(Math.floor(width / 5), Math.floor(height / 20));
            mat = new THREE.MeshLambertMaterial({ map: t, color: new THREE.Color(0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3) });
        } else {
            mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5) });
        }
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { type: 'building' };
        return mesh;
    }

    _buildTreeGroup(trunkHeight, trunkRadius, crownRadius) {
        const trunkGeom = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e2e, map: this.tex.trunk || null });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);

        const crownGeom = new THREE.SphereGeometry(crownRadius, 8, 8);
        const crownMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27, map: this.tex.leaves || null, transparent: !!this.tex.leaves, opacity: this.tex.leaves ? 0.8 : 1 });
        const crown = new THREE.Mesh(crownGeom, crownMat);
        crown.position.y = trunkHeight / 2 + crownRadius;
        trunk.position.y = trunkHeight / 2;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(crown);
        tree.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        tree.userData = { type: 'tree' };
        return tree;
    }

    _buildVehicle(type) {
        const group = new THREE.Group();
        let bodyGeom, bodyColor;
        switch (type) {
            case 'bus': bodyGeom = new THREE.BoxGeometry(12, 4, 3); bodyColor = new THREE.Color(0.3, 0.3, 0.9); break;
            case 'truck': bodyGeom = new THREE.BoxGeometry(8, 4, 3); bodyColor = new THREE.Color(0.8, 0.2, 0.2); break;
            case 'van': bodyGeom = new THREE.BoxGeometry(6, 3, 2.5); bodyColor = new THREE.Color(0.5, 0.5, 0.5); break;
            default: bodyGeom = new THREE.BoxGeometry(4, 2, 1.8); bodyColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        }
        const body = new THREE.Mesh(bodyGeom, new THREE.MeshLambertMaterial({ color: bodyColor }));
        body.position.y = 1;
        group.add(body);

        const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const wp = [
            [-bodyGeom.parameters.width / 2 + 0.5, -0.5, bodyGeom.parameters.depth / 2 - 0.5],
            [bodyGeom.parameters.width / 2 - 0.5, -0.5, bodyGeom.parameters.depth / 2 - 0.5],
            [-bodyGeom.parameters.width / 2 + 0.5, -0.5, -bodyGeom.parameters.depth / 2 + 0.5],
            [bodyGeom.parameters.width / 2 - 0.5, -0.5, -bodyGeom.parameters.depth / 2 + 0.5],
        ];
        wp.forEach(p => {
            const w = new THREE.Mesh(wheelGeom, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(...p);
            group.add(w);
        });
        group.traverse(c => { if (c.isMesh) c.castShadow = true; });
        group.userData = { type: 'vehicle', subtype: type };
        return group;
    }

    _buildCrystal() {
        const geom = new THREE.OctahedronGeometry(1 + Math.random() * 2);
        const mat = new THREE.MeshLambertMaterial({
            color: 0x88ffff, transparent: true, opacity: 0.7, emissive: 0x44bbbb, emissiveIntensity: 0.3, map: this.tex.crystal || null
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.userData = { type: 'crystal', floating: true };
        return mesh;
    }

    _buildPrism() {
        const geom = new THREE.CylinderGeometry(0, 2, 4, 3, 1);
        const mat = new THREE.MeshLambertMaterial({
            color: 0xff88ff, transparent: true, opacity: 0.8, emissive: 0xbb44bb, emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.userData = { type: 'prism', floating: true };
        return mesh;
    }
}