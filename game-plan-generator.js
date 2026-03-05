import config from './config.js';
import { ImageGenerator } from './image-generator.js';
import { AudioGenerator } from './audio-generator.js';
import { ScriptGenerator } from './script-generator.js';

// Handles all AI generation tasks - now focused on orchestration
export class GamePlanGenerator {
    constructor() {
        this.updateStatus = null;
        this.imageGenerator = new ImageGenerator();
        this.audioGenerator = new AudioGenerator();
        this.scriptGenerator = new ScriptGenerator();
    }
    
    // Set up status update function
    setStatusUpdater(updateFn) {
        this.updateStatus = updateFn;
        this.imageGenerator.setStatusUpdater(updateFn);
        this.audioGenerator.setStatusUpdater(updateFn);
        this.scriptGenerator.setStatusUpdater(updateFn);
    }
    
    // Generate complete game plan
    async generateComplete(userPrompt, customization) {
        const gamePlan = {};
        
        // Enhanced status update function with more detailed feedback
        this.updateStatus = (message, progress, details = '') => {
            const statusElement = document.getElementById('status-message');
            const progressBar = document.getElementById('progress-bar');
            
            if (statusElement) statusElement.textContent = message;
            if (progressBar) progressBar.style.width = `${progress * 100}%`;
            
            // Add detailed progress info
            if (details) {
                let detailsEl = document.getElementById('progress-details');
                if (!detailsEl) {
                    detailsEl = document.createElement('p');
                    detailsEl.id = 'progress-details';
                    detailsEl.className = 'progress-details';
                    const loadingIndicator = document.getElementById('loading-indicator');
                    if (loadingIndicator) loadingIndicator.appendChild(detailsEl);
                }
                detailsEl.textContent = details;
            }
            
            console.log(`Generation Progress: ${Math.round(progress * 100)}% - ${message} - ${details}`);
        };
        
        try {
            // Step 1: Generate game concept with enhanced prompting
            this.updateStatus("Analyzing your concept and generating game design...", 0.1, "Creating core gameplay mechanics");
            gamePlan.gameConcept = await this.generateContentWithRetry(
                config.prompts.gameConcept(userPrompt), 
                "professional game design and mechanics"
            );
            console.log("Game concept generated successfully");
            
            // Step 2: Generate world concept with better context
            this.updateStatus("Building immersive world and environment...", 0.2, "Crafting lore and environmental storytelling");
            gamePlan.worldConcept = await this.generateContentWithRetry(
                config.prompts.worldConcept(gamePlan.gameConcept), 
                "world building and environmental design"
            );
            console.log("World concept generated successfully");
            
            // Step 3: Generate character concepts with more depth
            this.updateStatus("Designing memorable characters...", 0.3, "Creating personalities and gameplay mechanics");
            gamePlan.characterConcepts = await this.generateContentWithRetry(
                config.prompts.characterConcepts(gamePlan.gameConcept), 
                "character design and development"
            );
            console.log("Character concepts generated successfully");
            
            // Step 4: Generate plot with narrative structure
            this.updateStatus("Crafting engaging storyline...", 0.4, "Developing plot structure and character arcs");
            gamePlan.plot = await this.generateContentWithRetry(
                config.prompts.plot(gamePlan.worldConcept, gamePlan.characterConcepts), 
                "narrative design and storytelling"
            );
            console.log("Plot generated successfully");
            
            // Step 5: Generate images with enhanced prompts
            this.updateStatus("Creating professional game artwork...", 0.5, "Generating high-quality visual assets");
            try {
                gamePlan.images = await this.imageGenerator.generateImages(gamePlan.gameConcept, customization);
                console.log("Images generated successfully");
            } catch (error) {
                console.error("Image generation failed:", error);
                this.updateStatus("Image generation encountered issues, continuing...", 0.65, "Some images may be placeholders");
                gamePlan.images = {}; // Continue with empty images
            }
            
            // Step 6: Generate scripts with better specifications
            this.updateStatus("Writing optimized game code...", 0.7, "Creating Unity scripts with best practices");
            try {
                gamePlan.scripts = await this.scriptGenerator.generateScripts(gamePlan.gameConcept, customization);
                console.log("Scripts generated successfully");
            } catch (error) {
                console.error("Script generation failed:", error);
                this.updateStatus("Script generation encountered issues, continuing...", 0.85, "Some scripts may be simplified");
                gamePlan.scripts = {}; // Continue with empty scripts
            }
            
            // Optional: Generate music with better prompts
            if (customization.useReplicate.generateMusic) {
                this.updateStatus("Composing atmospheric game music...", 0.9, "Creating background and action tracks");
                try {
                    gamePlan.music = await this.audioGenerator.generateMusic(gamePlan.gameConcept);
                    console.log("Music generated successfully");
                } catch (error) {
                    console.error("Music generation failed:", error);
                    this.updateStatus("Music generation failed, skipping...", 0.95, "Continuing without music");
                    gamePlan.music = null; // Continue without music
                }
            }
            
            this.updateStatus("Finalizing your complete game plan...", 1.0, "All assets generated successfully!");
            console.log("Game plan generation completed successfully:", gamePlan);
            
            return gamePlan;
            
        } catch (error) {
            console.error("Critical error in game plan generation:", error);
            this.updateStatus("Generation failed", 0, `Critical error: ${error.message}`);
            throw error;
        }
    }
    
    // Generate random game concept
    async generateRandomConcept() {
        try {
            // Pre-defined arrays for instant randomization
            const genres = ['2D Platformer', 'Metroidvania', 'Top-Down Shooter', 'Pixel Art RPG', 'Side-Scrolling Beat \'em up', 'Puzzle Platformer', 'Rogue-like Dungeon Crawler', 'Arcade-style SHMUP', 'Endless Runner', 'Stealth Action 2D'];
            const characters = ['Cursed Knight', 'Cyberpunk Mercenary', 'Time-Traveling Mage', 'Mutant Animal', 'Sentient Golem', 'Agile Space Explorer', 'Hardboiled Detective', 'Ghostly Samurai', 'Alchemist with a robotic arm', 'Lost child in a fairy world'];
            const worlds = ['a bio-luminescent underground kingdom', 'a city built on the back of a giant creature', 'a steampunk clockwork planet', 'a haunted victorian mansion that rearranges itself', 'a post-apocalyptic world reclaimed by neon-colored nature', 'a dream-like world made of clouds and surreal geometry', 'an ancient library containing infinite stories', 'a digital world inside a corrupted computer', 'a chain of floating sky islands connected by magic bridges', 'a microscopic world inside a single drop of water'];
            const mechanics = ['switching between two parallel dimensions', 'manipulating gravity to walk on walls', 'crafting new abilities by combining elemental powers', 'a rewind-time mechanic to undo mistakes', 'using a grappling hook for fast-paced traversal', 'possessing enemies to use their skills', 'a day/night cycle that changes the world and its inhabitants', 'painting elements into the world to solve puzzles', 'collecting and evolving companion creatures', 'a combo-based combat system that rewards style'];
            
            // Randomly select elements
            const randomGenre = genres[Math.floor(Math.random() * genres.length)];
            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
            const randomWorld = worlds[Math.floor(Math.random() * worlds.length)];
            const randomMechanic = mechanics[Math.floor(Math.random() * mechanics.length)];
            
            // Create simple one-sentence concept
            const concept = `A ${randomGenre} game where you play as a ${randomCharacter.toLowerCase()} exploring ${randomWorld} with a core mechanic of ${randomMechanic}.`;
            
            return concept;
            
        } catch (error) {
            console.error("Error generating random concept:", error);
            throw new Error(`Unable to generate random concept: ${error.message}`);
        }
    }
    
    async generatePlayableSpec(gamePlan, assetMap) {
        console.log("=== GENERATING NARRATIVE-DRIVEN LEVEL SPEC ===");
        console.log("Using comprehensive game analysis to create meaningful gameplay...");
        
        // Extract ALL gameplay context from deep analysis
        const gameplayVision = assetMap.gameplay?.vision || {};
        const playerInfo = assetMap.gameplay?.playerCharacter || { name: "Player", abilities: [] };
        const enemyInfo = assetMap.gameplay?.enemies || [];
        const objectInfo = assetMap.gameplay?.objects || [];
        const backgroundInfo = assetMap.gameplay?.background || {};
        const levelGuidance = assetMap.gameplay?.levelDesignGuidance || {};
        
        console.log("Gameplay vision:", gameplayVision.coreLoop);
        console.log("Key mechanics to incorporate:", gameplayVision.keyMechanics);
        console.log("Narrative goals:", gameplayVision.narrativeGoals);
        console.log("Level design approach:", levelGuidance.progression);
        
        // Build comprehensive entity descriptions with narrative context
        const entityDescriptions = [];
        
        enemyInfo.forEach((enemy, index) => {
            entityDescriptions.push({
                type: `enemy_${index}`,
                name: enemy.name || "Enemy",
                storyRole: enemy.storyRole || "antagonist",
                description: enemy.description || "An enemy",
                behavior: enemy.behavior || "patrol",
                threat: enemy.threat || "medium"
            });
            console.log(`Enemy ${index}: "${enemy.name}" - ${enemy.storyRole} - behaves: ${enemy.behavior}`);
        });
        
        objectInfo.forEach((obj, index) => {
            entityDescriptions.push({
                type: `object_${index}`,
                name: obj.name || "Object",
                description: obj.description || "An object",
                purpose: obj.purpose || "decoration",
                narrativeSignificance: obj.narrativeSignificance || "none"
            });
            console.log(`Object ${index}: "${obj.name}" - ${obj.purpose} - ${obj.narrativeSignificance}`);
        });

        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a master level designer creating narrative-driven 2D platformer levels. Your levels must tell a story through layout, enemy placement, and environmental design.

Respond directly with JSON per this schema and no other text:
{
  "backgroundKey": "string",
  "playerStart": { "x": number, "y": number },
  "platforms": [
    { "x": number, "y": number, "width": number, "height": number }
  ],
  "entities": [
    { "type": "string", "x": number, "y": number }
  ]
}`
                },
                {
                    role: "user",
                    content: `Create a deeply engaging first level that brings this game's story to life:

=== GAME CONCEPT & VISION ===
${gamePlan.gameConcept}

Core Gameplay Loop: ${gameplayVision.coreLoop || 'Explore and overcome challenges'}
Key Mechanics: ${gameplayVision.keyMechanics?.join(', ') || 'platforming, combat'}
Atmosphere: ${gameplayVision.atmosphere || 'adventure'}

=== WORLD & SETTING ===
${gamePlan.worldConcept}

Background Atmosphere: ${backgroundInfo.atmosphere || 'mysterious'}
Environmental Story Elements: ${backgroundInfo.storytellingElements?.join('; ') || 'environmental clues'}

=== CHARACTER & STORY ===
Player Character: ${playerInfo.name}
Description: ${playerInfo.description || 'The protagonist'}
Abilities: ${playerInfo.abilities?.join(', ') || 'jump, move'}
Motivations: ${playerInfo.motivations?.join(', ') || 'complete the journey'}

Plot Context: ${gamePlan.plot?.substring(0, 500)}...

=== LEVEL DESIGN GUIDANCE ===
Starting Scene: ${levelGuidance.startingScene || 'Begin the adventure'}
Progression: ${levelGuidance.progression || 'Gradually increase challenge'}
Environmental Storytelling: ${levelGuidance.environmentalStorytelling?.join('; ') || 'Use placement to tell story'}

=== AVAILABLE ENTITIES ===
${JSON.stringify(entityDescriptions, null, 2)}

=== YOUR MISSION ===
Design a level that:

1. TELLS THE STORY through layout
   - Opening platforms should establish the atmosphere
   - Enemy placement should reflect their narrative role and behaviors
   - Object placement should support their story significance

2. REFLECTS THE GAMEPLAY VISION
   - Incorporate the described core mechanics
   - Create challenges that use the player's specific abilities
   - Match the intended atmosphere

3. USES ENTITIES INTELLIGENTLY
   - Place each enemy type according to their story role and behavior
   - Position objects based on their narrative significance and purpose
   - Collectibles in meaningful locations, obstacles creating appropriate challenge
   - Enemies with "chase" behavior should have space to chase
   - Enemies with "patrol" behavior should have patrol paths
   - "Flying" enemies at appropriate heights

4. TECHNICAL REQUIREMENTS
   - Origin (0,0) is bottom-left, player starts near x:0, y:3
   - Create 10-15 platforms forming a narrative journey
   - Place 8-12 entities total, using each type at least once
   - Coordinates: x from -25 to 25, y from 0 to 20
   - Platform sizes: width 3-12, height 0.5-2
   - Start easy, build to a climax as described in level guidance

Background: ${assetMap.imagePool.background[0] || 'background_image_1'}

REMEMBER: This level should feel like it's part of the game's story, not just random platforms and enemies!`
                }
            ],
            json: true,
        });
        
        const spec = JSON.parse(completion.content);
        console.log("=== NARRATIVE-DRIVEN LEVEL SPEC GENERATED ===");
        console.log(`Platforms: ${spec.platforms?.length || 0}, Entities: ${spec.entities?.length || 0}`);
        console.log("Level reflects:", gameplayVision.coreLoop);
        return spec;
    }
    
    async generateContentWithRetry(prompt, role, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Generating content (attempt ${attempt}/${maxRetries}):`, role);
                
                const response = await websim.chat.completions.create({
                    messages: [
                        { 
                            role: "system", 
                            content: `You are a world-class expert in ${role} with 20+ years of industry experience. Provide detailed, professional, and innovative responses that demonstrate deep understanding of game development principles and player psychology. Your expertise should be evident in every aspect of your response.` 
                        },
                        { role: "user", content: prompt }
                    ]
                });
                
                if (response && response.content) {
                    console.log(`Content generated successfully for ${role}`);
                    return response.content;
                } else {
                    throw new Error('Invalid response format');
                }
                
            } catch (error) {
                lastError = error;
                console.error(`Content generation attempt ${attempt} failed for ${role}:`, error);
                
                if (attempt < maxRetries) {
                    console.log(`Retrying in 2 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.error(`All ${maxRetries} attempts failed for ${role}`);
                }
            }
        }
        
        throw new Error(`Failed to generate ${role} content after ${maxRetries} attempts: ${lastError.message}`);
    }
    
    async generateContent(prompt, role) {
        return this.generateContentWithRetry(prompt, role);
    }
}