export class AssetAnalyzer {
  async analyzeAssets(gamePlan) {
    console.log("Starting comprehensive deep analysis of entire game plan...");
    
    // Build complete context from ALL game plan elements
    const context = `
GAME CONCEPT:
${gamePlan.gameConcept}

WORLD DESIGN:
${gamePlan.worldConcept}

CHARACTER DETAILS:
${gamePlan.characterConcepts}

NARRATIVE/PLOT:
${gamePlan.plot}

AVAILABLE IMAGE ASSETS:
${Object.keys(gamePlan.images || {}).join(', ')}
`;

    console.log("Performing intelligent AI analysis of game narrative and assets...");
    console.log("This analysis will take time to properly understand the game's essence...");
    
    // Use AI to deeply analyze the entire game plan
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert game designer and asset analyzer. Your task is to deeply analyze the ENTIRE game plan - the concept, world, characters, plot, and visual assets - to create a comprehensive understanding of how everything should work together in a playable game.

Read through ALL the provided information carefully. Extract:
1. The core gameplay mechanics described in the concept
2. Character abilities, motivations, and role in the story
3. The world's atmosphere and how it should feel
4. Key plot points that should be reflected in gameplay
5. How each visual asset should function based on the narrative

Then intelligently map each asset to its role, ensuring the gameplay reflects the story.

Respond with JSON following this schema:
{
  "gameplayVision": {
    "coreLoop": "string - describe the main gameplay loop based on concept",
    "atmosphere": "string - the mood and feel from world/plot",
    "keyMechanics": ["string - mechanics mentioned in concept"],
    "narrativeGoals": ["string - story objectives from plot"]
  },
  "playerCharacter": {
    "assetKey": "string",
    "name": "string - from character concepts",
    "description": "string - from character concepts",
    "abilities": ["string - specific abilities from concept/characters"],
    "motivations": ["string - from plot"],
    "width": number,
    "height": number
  },
  "enemies": [
    {
      "assetKey": "string",
      "name": "string - from characters/plot",
      "description": "string - who they are in the story",
      "behavior": "patrol|chase|stationary|flying - based on narrative role",
      "threat": "low|medium|high - based on plot significance",
      "width": number,
      "height": number,
      "storyRole": "string - their purpose in the narrative"
    }
  ],
  "objects": [
    {
      "assetKey": "string",
      "name": "string - meaningful name from world/plot",
      "description": "string - what this represents in the story",
      "purpose": "decoration|collectible|obstacle|interactive|goal",
      "collision": boolean,
      "width": number,
      "height": number,
      "narrativeSignificance": "string - why this object matters to the story"
    }
  ],
  "background": {
    "assetKey": "string",
    "description": "string - detailed description from world concept",
    "atmosphere": "string - mood from world/plot",
    "storytellingElements": ["string - environmental story beats"]
  },
  "levelDesignGuidance": {
    "startingScene": "string - how should the level begin based on plot",
    "progression": "string - how difficulty/story should progress",
    "climax": "string - where should tension peak",
    "environmentalStorytelling": ["string - ways the level layout tells the story"]
  }
}`
        },
        {
          role: "user",
          content: `Read this ENTIRE game plan carefully and perform a comprehensive analysis. Take your time to understand how all elements connect:

${context}

Your analysis must:

1. READ THE FULL GAME CONCEPT and extract the core gameplay mechanics and unique features described
2. READ THE CHARACTER CONCEPTS and identify the protagonist, their abilities, personality, and role
3. READ THE PLOT and understand the character motivations, conflicts, and story progression
4. READ THE WORLD CONCEPT and understand the atmosphere, setting, and environmental elements
5. EXAMINE EACH IMAGE ASSET and intelligently determine its role based on ALL the above context

Then categorize each asset with:
- Intelligent size assignments based on narrative importance (protagonists larger, enemies varied by threat, objects by purpose)
- Specific abilities for the player that directly reflect what's described in the game concept
- Enemy behaviors that match their narrative role and the described mechanics
- Object purposes that make sense within the story (are they collectibles mentioned in plot? obstacles in the world? goals?)
- A background that captures the world's atmosphere

BE SMART: Don't just match keywords. Understand the STORY and make each asset serve the narrative.
For example, if the concept describes "time manipulation powers", ensure those are in the player abilities.
If enemies are described as "patrolling guards", give them patrol behavior.
If objects are "power crystals" in the plot, mark them as collectibles with narrative significance.

Take your time with this analysis - it's crucial for creating a meaningful playable experience.`
        }
      ],
      json: true
    });

    const analysis = JSON.parse(completion.content);
    console.log("Comprehensive AI analysis complete:", analysis);
    console.log("Gameplay vision:", analysis.gameplayVision);
    console.log("Player character:", analysis.playerCharacter?.name, "with abilities:", analysis.playerCharacter?.abilities);

    // Build comprehensive asset map with full gameplay context
    const result = {
      images: {},
      imagePool: {
        character: [],
        enemy: [],
        object: [],
        background: []
      },
      gameplay: {
        vision: analysis.gameplayVision,
        playerCharacter: analysis.playerCharacter,
        enemies: analysis.enemies,
        objects: analysis.objects,
        background: analysis.background,
        levelDesignGuidance: analysis.levelDesignGuidance
      }
    };

    // Process player character with full context
    if (analysis.playerCharacter && analysis.playerCharacter.assetKey) {
      const key = analysis.playerCharacter.assetKey;
      result.images[key] = {
        category: 'character',
        useBillboard: true,
        width: analysis.playerCharacter.width || 1.8,
        height: analysis.playerCharacter.height || 3.0,
        collision: false,
        gameplay: analysis.playerCharacter
      };
      result.imagePool.character.push(key);
      console.log(`Player "${analysis.playerCharacter.name}" analyzed with abilities:`, analysis.playerCharacter.abilities);
      console.log(`Player motivation:`, analysis.playerCharacter.motivations);
    }

    // Process enemies with narrative context
    (analysis.enemies || []).forEach((enemy, idx) => {
      if (enemy.assetKey) {
        const key = enemy.assetKey;
        result.images[key] = {
          category: 'enemy',
          useBillboard: true,
          width: enemy.width || 1.6,
          height: enemy.height || 2.5,
          collision: true,
          gameplay: enemy
        };
        result.imagePool.enemy.push(key);
        console.log(`Enemy "${enemy.name}" - Role: ${enemy.storyRole}, Behavior: ${enemy.behavior}, Threat: ${enemy.threat}`);
      }
    });

    // Process objects with narrative significance
    (analysis.objects || []).forEach((obj, idx) => {
      if (obj.assetKey) {
        const key = obj.assetKey;
        result.images[key] = {
          category: 'object',
          useBillboard: true,
          width: obj.width || 1.2,
          height: obj.height || 1.2,
          collision: obj.collision !== false,
          gameplay: obj
        };
        result.imagePool.object.push(key);
        console.log(`Object "${obj.name}" - Purpose: ${obj.purpose}, Story significance: ${obj.narrativeSignificance}`);
      }
    });

    // Process background with atmospheric context
    if (analysis.background && analysis.background.assetKey) {
      const key = analysis.background.assetKey;
      result.images[key] = {
        category: 'background',
        useBillboard: false,
        width: 0,
        height: 0,
        collision: false,
        gameplay: analysis.background
      };
      result.imagePool.background.push(key);
      console.log(`Background atmosphere: ${analysis.background.atmosphere}`);
      console.log(`Environmental storytelling:`, analysis.background.storytellingElements);
    }

    console.log("=== COMPREHENSIVE ANALYSIS COMPLETE ===");
    console.log("Core gameplay loop:", analysis.gameplayVision?.coreLoop);
    console.log("Key mechanics:", analysis.gameplayVision?.keyMechanics);
    console.log("Narrative goals:", analysis.gameplayVision?.narrativeGoals);
    console.log("Level design guidance:", analysis.levelDesignGuidance);
    
    return result;
  }
}