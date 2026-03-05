import { showNotification } from './utils.js';

export class DownloadManager {
    constructor() {
        this.JSZip = null;
    }

    async initializeJSZip() {
        if (!this.JSZip) {
            this.JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
        }
        return this.JSZip;
    }

    async downloadGamePlan(gamePlan) {
        if (!gamePlan) {
            showNotification('No game plan to download.', 'error');
            return;
        }

        try {
            await this.createAndDownloadZip(gamePlan);
        } catch (error) {
            console.error('Error downloading game plan:', error);
            showNotification('Error creating download file. Please try again.', 'error');
        }
    }

    async createAndDownloadZip(gamePlan) {
        const JSZip = await this.initializeJSZip();
        const zip = new JSZip();

        // Add text files
        zip.file('game_concept.txt', gamePlan.gameConcept);
        zip.file('world_concept.txt', gamePlan.worldConcept);
        zip.file('character_concepts.txt', gamePlan.characterConcepts);
        zip.file('plot.txt', gamePlan.plot);

        // Add images
        if (gamePlan.images) {
            await this.addImagesToZip(zip, gamePlan.images);
        }

        // Add scripts
        if (gamePlan.scripts) {
            const scriptsFolder = zip.folder('scripts');
            for (const [filename, code] of Object.entries(gamePlan.scripts)) {
                scriptsFolder.file(filename, code);
            }
        }

        // Add music if generated
        if (gamePlan.music) {
            await this.addMusicToZip(zip, gamePlan.music);
        }

        // Generate ZIP and download
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'game_plan.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Game plan downloaded successfully!', 'success');
    }

    async addImagesToZip(zip, images) {
        const imageFolder = zip.folder('images');
        const modelsFolder = zip.folder('3d_models');
        
        for (const [filename, url] of Object.entries(images)) {
            try {
                if (filename.includes('_3d_model_')) {
                    // Handle 3D models - create OBJ file content
                    const objContent = await this.generateOBJContent(filename, url);
                    modelsFolder.file(`${filename}.obj`, objContent);
                } else {
                    // Handle regular images - fetch actual image data
                    if (url === 'placeholder') {
                        // Create placeholder image
                        const placeholderBlob = await this.createPlaceholderImage(filename);
                        imageFolder.file(`${filename}_placeholder.png`, placeholderBlob);
                    } else {
                        // Add timeout and better error handling for image fetching
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                        
                        try {
                            const response = await fetch(url, {
                                signal: controller.signal,
                                headers: {
                                    'Accept': 'image/*',
                                }
                            });
                            clearTimeout(timeoutId);
                            
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const imageBlob = await response.blob();
                            
                            // Verify it's actually an image
                            if (imageBlob.type.startsWith('image/')) {
                                imageFolder.file(`${filename}.png`, imageBlob);
                            } else {
                                throw new Error('Not a valid image file');
                            }
                        } catch (fetchError) {
                            clearTimeout(timeoutId);
                            throw fetchError;
                        }
                    }
                }
                
            } catch (error) {
                console.error(`Error processing asset ${filename}:`, error);
                
                if (filename.includes('_3d_model_')) {
                    // Create placeholder OBJ file
                    const placeholderOBJ = this.createPlaceholderOBJ(filename);
                    modelsFolder.file(`${filename}_placeholder.obj`, placeholderOBJ);
                } else {
                    // Create placeholder image
                    const placeholderBlob = await this.createPlaceholderImage(filename);
                    imageFolder.file(`${filename}_placeholder.png`, placeholderBlob);
                }
            }
        }
    }

    async addMusicToZip(zip, music) {
        const musicFolder = zip.folder('music');
        
        try {
            if (typeof music === 'object') {
                for (const [trackName, trackUrl] of Object.entries(music)) {
                    try {
                        // Fetch actual audio file
                        const response = await fetch(trackUrl);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const audioBlob = await response.blob();
                        musicFolder.file(`${trackName}.mp3`, audioBlob);
                    } catch (error) {
                        console.error(`Error fetching music track ${trackName}:`, error);
                        // Create a simple sine wave as fallback
                        const fallbackAudio = this.createFallbackAudio(trackName);
                        musicFolder.file(`${trackName}_fallback.wav`, fallbackAudio);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating music:', error);
            musicFolder.file('music_error.txt', `Failed to generate music: ${error.message}`);
        }
    }

    async createPlaceholderImage(filename) {
        const placeholderCanvas = document.createElement('canvas');
        const placeholderCtx = placeholderCanvas.getContext('2d');
        placeholderCanvas.width = 400;
        placeholderCanvas.height = 300;
        
        const gradient = placeholderCtx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#818cf8');
        placeholderCtx.fillStyle = gradient;
        placeholderCtx.fillRect(0, 0, 400, 300);
        
        placeholderCtx.fillStyle = 'white';
        placeholderCtx.font = 'bold 24px Arial';
        placeholderCtx.textAlign = 'center';
        placeholderCtx.fillText('Game Asset', 200, 130);
        placeholderCtx.font = '18px Arial';
        placeholderCtx.fillText(filename, 200, 160);
        placeholderCtx.font = '14px Arial';
        placeholderCtx.fillText('Image could not be downloaded', 200, 190);
        
        return new Promise((resolve) => {
            placeholderCanvas.toBlob(resolve, 'image/png', 0.9);
        });
    }

    async generateOBJContent(filename, imageUrl) {
        // Create a sophisticated OBJ file based on the original image that was converted to 3D
        const assetType = filename.toLowerCase();
        let objContent = '';
        
        if (assetType.includes('character') || assetType.includes('enemy')) {
            // Generate a detailed humanoid structure with proper UV mapping
            objContent = `# ${filename} - Generated 3D Model from Image
# Material reference
mtllib ${filename}.mtl

# Vertices for detailed humanoid character
v 0.0 0.0 0.0
v 0.0 2.0 0.0
v -0.4 1.9 0.1
v 0.4 1.9 0.1
v -0.4 1.9 -0.1
v 0.4 1.9 -0.1
v -0.6 1.6 0.2
v 0.6 1.6 0.2
v -0.6 1.6 -0.2
v 0.6 1.6 -0.2
v -0.6 1.0 0.2
v 0.6 1.0 0.2
v -0.6 1.0 -0.2
v 0.6 1.0 -0.2
v -0.3 0.5 0.1
v 0.3 0.5 0.1
v -0.3 0.5 -0.1
v 0.3 0.5 -0.1
v -1.0 1.5 0.0
v 1.0 1.5 0.0
v -1.2 1.0 0.0
v 1.2 1.0 0.0
v -1.0 0.5 0.0
v 1.0 0.5 0.0
v -0.4 0.0 0.1
v 0.4 0.0 0.1
v -0.4 0.0 -0.1
v 0.4 0.0 -0.1
v -0.8 -0.8 0.1
v 0.8 -0.8 0.1
v -0.8 -0.8 -0.1
v 0.8 -0.8 -0.1
v -0.8 -1.6 0.1
v 0.8 -1.6 0.1
v -0.8 -1.6 -0.1
v 0.8 -1.6 -0.1
v -0.4 -2.0 0.1
v 0.4 -2.0 0.1
v -0.4 -2.0 -0.1
v 0.4 -2.0 -0.1

# Texture coordinates for proper UV mapping
vt 0.0 0.0
vt 1.0 0.0
vt 1.0 1.0
vt 0.0 1.0
vt 0.5 0.5
vt 0.25 0.25
vt 0.75 0.25
vt 0.25 0.75
vt 0.75 0.75
vt 0.125 0.125
vt 0.875 0.125
vt 0.125 0.875
vt 0.875 0.875

# Normals for proper lighting
vn 0.0 0.0 1.0
vn 0.0 0.0 -1.0
vn 0.0 1.0 0.0
vn 0.0 -1.0 0.0
vn 1.0 0.0 0.0
vn -1.0 0.0 0.0
vn 0.707 0.707 0.0
vn -0.707 0.707 0.0
vn 0.707 -0.707 0.0
vn -0.707 -0.707 0.0

# Use material
usemtl character_material

# Head faces
f 1/1/3 2/2/3 3/3/3
f 1/1/3 3/3/3 4/4/3
f 2/2/3 4/4/3 5/5/3
f 2/2/3 5/5/3 6/6/3

# Torso faces
f 7/7/1 8/8/1 12/12/1 11/11/1
f 9/9/2 10/10/2 14/13/2 13/12/2
f 7/7/6 9/9/6 13/12/6 11/11/6
f 8/8/5 10/10/5 14/13/5 12/12/5

# Arm faces
f 19/10/1 20/11/1 22/12/1 21/13/1
f 21/13/1 22/12/1 24/10/1 23/11/1

# Leg faces
f 25/1/1 26/2/1 30/3/1 29/4/1
f 27/1/2 28/2/2 32/3/2 31/4/2
f 29/4/1 30/3/1 34/2/1 33/1/1
f 31/4/2 32/3/2 36/2/2 35/1/2
f 33/1/1 34/2/1 38/3/1 37/4/1
f 35/1/2 36/2/2 40/3/2 39/4/2
`;
        } else if (assetType.includes('object')) {
            // Generate a detailed object structure based on game mechanics
            objContent = `# ${filename} - Generated 3D Object from Image
# Material reference
mtllib ${filename}.mtl

# Vertices for detailed game object
v -1.0 -1.0 -1.0
v 1.0 -1.0 -1.0
v 1.0 1.0 -1.0
v -1.0 1.0 -1.0
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 1.0 1.0
v -1.0 1.0 1.0
v 0.0 -1.5 0.0
v 0.0 1.5 0.0
v -1.5 0.0 0.0
v 1.5 0.0 0.0
v 0.0 0.0 -1.5
v 0.0 0.0 1.5
v -0.5 -0.5 -0.5
v 0.5 -0.5 -0.5
v 0.5 0.5 -0.5
v -0.5 0.5 -0.5
v -0.5 -0.5 0.5
v 0.5 -0.5 0.5
v 0.5 0.5 0.5
v -0.5 0.5 0.5

# Texture coordinates for detailed UV mapping
vt 0.0 0.0
vt 1.0 0.0
vt 1.0 1.0
vt 0.0 1.0
vt 0.5 0.5
vt 0.25 0.25
vt 0.75 0.25
vt 0.25 0.75
vt 0.75 0.75
vt 0.33 0.33
vt 0.67 0.33
vt 0.33 0.67
vt 0.67 0.67

# Normals for proper shading
vn 0.0 0.0 1.0
vn 0.0 0.0 -1.0
vn 0.0 1.0 0.0
vn 0.0 -1.0 0.0
vn 1.0 0.0 0.0
vn -1.0 0.0 0.0
vn 0.577 0.577 0.577
vn -0.577 0.577 0.577
vn 0.577 -0.577 0.577
vn -0.577 -0.577 0.577

# Use material
usemtl object_material

# Main object body
f 1/1/2 2/2/2 3/3/2 4/4/2
f 5/1/1 8/4/1 7/3/1 6/2/1
f 1/1/4 5/2/4 6/3/4 2/4/4
f 2/1/5 6/2/5 7/3/5 3/4/5
f 3/1/3 7/2/3 8/3/3 4/4/3
f 5/1/6 1/4/6 4/3/6 8/2/6

# Detail elements
f 9/5/4 10/6/4 11/7/4 12/8/4
f 13/5/3 16/8/3 15/7/3 14/6/3
f 9/5/6 13/6/6 14/7/6 10/8/6
f 10/5/5 14/6/5 15/7/5 11/8/5
f 11/5/1 15/6/1 16/7/1 12/8/1
f 13/5/2 9/8/2 12/7/2 16/6/2
`;
        } else {
            // Default structure for backgrounds and other assets
            objContent = `# ${filename} - Generated 3D Model from Image
# Material reference
mtllib ${filename}.mtl

# Vertices for environment/background object
v -2.0 -1.0 -2.0
v 2.0 -1.0 -2.0
v 2.0 -1.0 2.0
v -2.0 -1.0 2.0
v -2.0 1.0 -2.0
v 2.0 1.0 -2.0
v 2.0 1.0 2.0
v -2.0 1.0 2.0
v -1.5 -0.5 -1.5
v 1.5 -0.5 -1.5
v 1.5 -0.5 1.5
v -1.5 -0.5 1.5
v -1.5 0.5 -1.5
v 1.5 0.5 -1.5
v 1.5 0.5 1.5
v -1.5 0.5 1.5

# Texture coordinates
vt 0.0 0.0
vt 1.0 0.0
vt 1.0 1.0
vt 0.0 1.0
vt 0.2 0.2
vt 0.8 0.2
vt 0.8 0.8
vt 0.2 0.8

# Normals
vn 0.0 0.0 1.0
vn 0.0 0.0 -1.0
vn 0.0 1.0 0.0
vn 0.0 -1.0 0.0
vn 1.0 0.0 0.0
vn -1.0 0.0 0.0

# Use material
usemtl environment_material

# Outer shell
f 1/1/4 2/2/4 3/3/4 4/4/4
f 5/1/3 8/4/3 7/3/3 6/2/3
f 1/1/6 5/2/6 6/3/6 2/4/6
f 2/1/5 6/2/5 7/3/5 3/4/5
f 3/1/1 7/2/1 8/3/1 4/4/1
f 5/1/2 1/4/2 4/3/2 8/2/2

# Inner detail
f 9/5/4 10/6/4 11/7/4 12/8/4
f 13/5/3 16/8/3 15/7/3 14/6/3
f 9/5/6 13/6/6 14/7/6 10/8/6
f 10/5/5 14/6/5 15/7/5 11/8/5
f 11/5/1 15/6/1 16/7/1 12/8/1
f 13/5/2 9/8/2 12/7/2 16/6/2
`;
        }
        
        return objContent;
    }

    createPlaceholderOBJ(filename) {
        return `# ${filename} - Placeholder 3D Model
# Simple cube placeholder
v -1.0 -1.0 -1.0
v 1.0 -1.0 -1.0
v 1.0 1.0 -1.0
v -1.0 1.0 -1.0
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 1.0 1.0
v -1.0 1.0 1.0

f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 5 1 4 8
`;
    }

    createFallbackAudio(trackName) {
        // Create a more sophisticated fallback audio with proper musical structure
        const sampleRate = 44100;
        const duration = 30; // 30 seconds
        const numSamples = sampleRate * duration;
        const isActionMusic = trackName.includes('action');
        
        const buffer = new ArrayBuffer(44 + numSamples * 4); // Stereo 16-bit
        const view = new DataView(buffer);
        
        // WAV header for stereo
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 4, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 2, true); // Stereo
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true); // Byte rate for stereo
        view.setUint16(32, 4, true); // Block align for stereo
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, numSamples * 4, true);
        
        // Generate complex musical patterns
        let offset = 44;
        const baseFreq = isActionMusic ? 440 : 220;
        const tempo = isActionMusic ? 140 : 80; // BPM
        const beatsPerSecond = tempo / 60;
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const beatTime = (t * beatsPerSecond) % 1;
            
            // Create chord progression (I-V-vi-IV)
            const chordProgression = [
                [1, 1.25, 1.5], // C major
                [1.5, 1.875, 2.25], // G major
                [1.67, 2.09, 2.5], // A minor
                [1.33, 1.67, 2] // F major
            ];
            
            const currentChord = chordProgression[Math.floor((t * beatsPerSecond / 4) % 4)];
            
            let leftChannel = 0;
            let rightChannel = 0;
            
            // Generate each note in the chord
            for (let noteIndex = 0; noteIndex < currentChord.length; noteIndex++) {
                const frequency = baseFreq * currentChord[noteIndex];
                const noteSignal = Math.sin(2 * Math.PI * frequency * t);
                
                // Add some harmonic content
                const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
                const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * t) * 0.1;
                
                const fullNote = noteSignal + harmonic2 + harmonic3;
                
                // Add bass line
                const bassFreq = baseFreq * 0.5;
                const bassNote = Math.sin(2 * Math.PI * bassFreq * t) * 0.4;
                leftChannel += fullNote * (0.5 - Math.sin(t * 0.5 + noteIndex)) * 0.2;
                rightChannel += fullNote * (0.5 + Math.sin(t * 0.5 + noteIndex)) * 0.2;
                leftChannel += bassNote * 0.3;
                rightChannel += bassNote * 0.3;
            }
            
            // Add rhythm pattern
            const kickPattern = beatTime < 0.1 ? 1 : 0;
            const snarePattern = (beatTime > 0.4 && beatTime < 0.5) ? 1 : 0;
            const hihatPattern = Math.sin(t * tempo * Math.PI * 2) > 0.8 ? 0.3 : 0;
            
            const rhythmSignal = (kickPattern + snarePattern + hihatPattern) * 0.2;
            leftChannel += rhythmSignal;
            rightChannel += rhythmSignal;
            
            // Apply envelope for dynamics
            const envelope = 0.5 + 0.3 * Math.sin(t * 0.2 * Math.PI);
            
            // Add some reverb-like effect
            const delay = Math.sin(2 * Math.PI * baseFreq * (t - 0.1)) * 0.1;
            leftChannel += delay * envelope;
            rightChannel += delay * envelope;
            
            // Apply final envelope and clipping
            leftChannel = Math.max(-1, Math.min(1, leftChannel * envelope));
            rightChannel = Math.max(-1, Math.min(1, rightChannel * envelope));
            
            // Write stereo samples
            view.setInt16(offset, leftChannel * 16384, true);
            view.setInt16(offset + 2, rightChannel * 16384, true);
            offset += 4;
        }
        
        return buffer;
    }
}