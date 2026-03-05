// Configuration for the GameForge AI application

const config = {
    // Asset types and their default counts
    assetTypes: {
        images: [
            { type: 'Character', count: 1 },
            { type: 'Enemy', count: 1 },
            { type: 'Background', count: 1 },
            { type: 'Object', count: 2 }
        ],
        scripts: [
            { type: 'Player', count: 1 },
            { type: 'Enemy', count: 1 },
            { type: 'Game Object', count: 3 },
            { type: 'Level Background', count: 1 }
        ]
    },
    
    // API-related settings
    api: {
        openAIModelName: 'gpt-4',
        imageModelName: 'dall-e-3',
        imageSize: '1024x1024',
        
        endpoints: {
            // Removed external API endpoints as we're using WebSim
        }
    },
    
    // Game content generation prompts
    prompts: {
        gameConcept: (userPrompt) => 
            `You are a professional game designer. Create a comprehensive 2D game concept based on: "${userPrompt}". 

Your response should include:
- Core gameplay mechanics and unique features
- Target audience and genre
- Visual style and art direction
- Technical requirements and WASD movement integration
- Monetization strategy (if applicable)
- Key differentiators from existing games

Make it detailed, innovative, and commercially viable. Focus on creating something that would genuinely engage players.`,
            
        worldConcept: (gameConcept) => 
            `You are a world-building expert. Create a rich, immersive world concept for this 2D game: "${gameConcept}".

Your response should include:
- Detailed setting and atmosphere
- Lore and backstory
- Environmental storytelling opportunities
- Level design philosophy
- Interactive elements and world mechanics
- Audio-visual mood and tone
- How the world supports the core gameplay

Make it feel alive and purposeful, not just decorative.`,
            
        characterConcepts: (gameConcept) => 
            `You are a character designer. Create compelling character concepts for this 2D game: "${gameConcept}".

For each character, provide:
- Detailed visual description and personality
- Backstory and motivation
- Unique abilities and gameplay mechanics
- Character progression opportunities
- Relationship to the game world
- Animation and movement style
- Combat/interaction mechanics

Focus on characters that players will remember and care about.`,
            
        plot: (worldConcept, characterConcepts) => 
            `You are a narrative designer. Create an engaging plot for this 2D game based on:
World: "${worldConcept}"
Characters: "${characterConcepts}"

Your response should include:
- Three-act story structure
- Key plot points and narrative beats
- Character development arcs
- Dialogue examples and tone
- Environmental storytelling integration
- Player agency and choice moments
- Emotional stakes and tension
- Satisfying resolution

Make it emotionally engaging and interactive, not just a cutscene sequence.`,
            
        imagePrompts: {
            Character: "Create a highly detailed, professional game character concept art in a painterly digital art style. The character should be front-facing in a confident neutral pose, with intricate costume details, distinct facial features, and rich textures. Use dramatic lighting with strong contrasts. The design should be optimized for 2D game animation with clear silhouettes and readable details at small sizes. Include subtle background elements that hint at the character's role. Style: modern digital concept art with AAA game quality.",
            
            Enemy: "Design a menacing, professionally detailed enemy character concept art in a dark fantasy style. The creature should be front-facing with an intimidating pose, featuring unique anatomical details, battle scars, and weapon/armor elements. Use moody lighting with deep shadows. The design should be memorable and distinctive with clear gameplay implications. Include environmental context that suggests the enemy's habitat. Style: detailed concept art with horror/fantasy influences and AAA production values.",
            
            Background: "Create a stunning, atmospheric 2D game level background with professional game art quality. The scene should have clear depth layers (foreground, midground, background) with parallax scrolling potential. Include environmental storytelling elements, interactive object placement areas, and atmospheric effects. Use cinematic composition with strong focal points and leading lines. The lighting should support gameplay readability while maintaining visual appeal. Style: modern 2D game art with film-quality environmental design.",
            
            Object: "Design a detailed, iconic game object with professional item design quality. The object should be instantly recognizable with clear gameplay purpose, featuring rich textures, appropriate scale, and visual hierarchy. Use clean, readable design with strong silhouette. Include subtle animation potential and interaction indicators. The design should fit seamlessly into the game world while standing out as important. Style: polished game asset with AAA item design standards."
        },
        
        scriptDescriptions: {
            Player: (gameConcept) => 
                `You are a Unity game programmer. Create a comprehensive player controller script for this game: "${gameConcept}".

The script should include:
- Smooth WASD movement with customizable speed
- Jump mechanics with variable height
- Attack/interaction system (spacebar)
- Animation controller integration
- Sound effect triggers
- Health and damage system
- Collision detection and response
- Input buffering for responsive controls
- State machine for different player states
- Performance optimization techniques

Write clean, well-commented C# code that follows Unity best practices.`,
                
            Enemy: (gameConcept) => 
                `You are a Unity AI programmer. Create an intelligent enemy behavior script for this game: "${gameConcept}".

The script should include:
- Sophisticated AI state machine (patrol, chase, attack, retreat)
- Pathfinding and obstacle avoidance
- Player detection system with sight/hearing
- Combat behavior with varied attack patterns
- Health and damage management
- Animation integration
- Sound and visual effect triggers
- Difficulty scaling capabilities
- Performance optimization for multiple instances
- Debugging and tuning parameters

Write modular, reusable C# code with clear documentation.`,
                
            'Game Object': (gameConcept) => 
                `You are a Unity gameplay programmer. Create a versatile game object script for this game: "${gameConcept}".

The script should include:
- Interactive behavior system
- Visual and audio feedback
- Collision and trigger detection
- State management (active/inactive/destroyed)
- Animation and effect integration
- Inventory or collection mechanics
- Respawn or regeneration logic
- Configuration options for designers
- Performance optimization
- Editor tools for easy setup

Write flexible, designer-friendly C# code that can be easily customized.`,
                
            'Level Background': (gameConcept) => 
                `You are a Unity technical artist. Create a dynamic background system script for this game: "${gameConcept}".

The script should include:
- Parallax scrolling with multiple layers
- Dynamic lighting and atmosphere
- Particle effects and ambient animations
- Camera follow and boundary systems
- Environmental hazards or interactions
- Performance optimization for mobile
- Customizable visual parameters
- Seamless level transitions
- Weather or time-of-day effects
- Memory management for large scenes

Write optimized C# code that balances visual quality with performance.`
        }
    },
    
    // Image sizes for different asset types
    imageSizes: {
        Character: '1024x1792',
        Enemy: '1024x1792',
        Background: '1792x1024',
        Object: '1024x1024'
    },
    
    // Features that are in beta/experimental
    experimentalFeatures: {
        convert3D: true,
        generateMusic: true
    }
};

export default config;