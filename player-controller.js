import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class PlayerController {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.moveSpeed = 10;
        this.rotationSpeed = 0.002;
        this.velocity = new THREE.Vector3();
        this.canJump = false;
        this.gravity = -30;
        this.jumpForce = 15;
        this.playerHeight = 2;
        this.playerRadius = 1;

        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
    }

    setupControls() {
        this.renderer.domElement.addEventListener('click', () => {
            if (document.fullscreenElement) {
                this.requestPointerLock();
            }
        });

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        document.addEventListener('pointerlockchange', () => {
            // Notify if pointer lock is lost (e.g., user presses ESC)
            if (document.pointerLockElement !== this.renderer.domElement) {
                document.dispatchEvent(new CustomEvent('pointerLockLost'));
            }
        });
    }

    async requestPointerLock() {
        try {
            if (this.renderer && this.renderer.domElement) {
                await this.renderer.domElement.requestPointerLock();
            }
        } catch (error) {
            console.warn('Pointer lock request failed:', error);
        }
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyD': this.moveRight = true; break;
            case 'Space': 
                if (this.canJump) {
                    event.preventDefault();
                    this.moveUp = true; 
                }
                break;
            case 'ShiftLeft': this.moveDown = true; break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
            case 'Space': this.moveUp = false; break;
            case 'ShiftLeft': this.moveDown = false; break;
        }
    }

    onMouseMove(event) {
        if (document.pointerLockElement === this.renderer.domElement) {
            this.camera.rotation.y -= event.movementX * this.rotationSpeed;
            this.camera.rotation.x -= event.movementY * this.rotationSpeed;
            // Clamp vertical rotation
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        }
    }

    updateMovement(deltaTime) {
        const direction = new THREE.Vector3();
        const rotation = this.camera.rotation.clone();

        // Movement input
        if (this.moveForward) direction.z -= 1;
        if (this.moveBackward) direction.z += 1;
        if (this.moveLeft) direction.x -= 1;
        if (this.moveRight) direction.x += 1;

        // Normalize and apply rotation (only yaw for horizontal movement)
        direction.normalize();
        direction.applyEuler(new THREE.Euler(0, rotation.y, 0));

        // Apply movement
        this.velocity.x = direction.x * this.moveSpeed;
        this.velocity.z = direction.z * this.moveSpeed;

        // Handle jumping
        if (this.moveUp && this.canJump) {
            this.velocity.y = this.jumpForce;
            this.canJump = false;
        }

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Update position
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.camera.position.add(deltaPosition);

        // Simple ground collision (reset canJump and velocity on landing)
        if (this.camera.position.y < this.playerHeight) {
            this.camera.position.y = this.playerHeight;
            this.velocity.y = 0;
            this.canJump = true;
        }

        // Manual vertical movement (for development/flying)
        if (this.moveDown) {
            this.camera.position.y -= this.moveSpeed * deltaTime;
        }
    }

    resetPosition() {
        this.camera.position.set(0, 10, 20);
        this.camera.rotation.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.canJump = true;
    }
}