import config from './config.js';

export class ScriptGenerator {
    constructor() {
        this.updateStatus = null;
    }

    setStatusUpdater(updateFn) {
        this.updateStatus = updateFn;
    }

    async generateScripts(gameConcept, customization) {
        const scripts = {};
        
        try {
            console.log(`Starting script generation for ${customization.scriptTypes.length} script types`);
            
            // For each script type
            for (const type of customization.scriptTypes) {
                console.log(`Generating ${customization.scriptCounts[type]} scripts for type: ${type}`);
                
                // For each script count
                for (let i = 0; i < customization.scriptCounts[type]; i++) {
                    const scriptPrompt = config.prompts.scriptDescriptions[type](gameConcept) + ` - Instance ${i + 1}`;
                    
                    try {
                        console.log(`Generating script: ${type.replace(' ', '')}_${i + 1}.cs`);
                        
                        // Generate script content with retry
                        const scriptCode = await this.generateContentWithRetry(scriptPrompt, "Unity scripting", 3);
                        
                        // Store the script
                        scripts[`${type.replace(' ', '')}_${i + 1}.cs`] = scriptCode;
                        console.log(`Script generated successfully: ${type.replace(' ', '')}_${i + 1}.cs`);
                        
                    } catch (error) {
                        console.error(`Failed to generate script ${type.replace(' ', '')}_${i + 1}.cs:`, error);
                        // Create a placeholder script
                        scripts[`${type.replace(' ', '')}_${i + 1}.cs`] = `// Script generation failed: ${error.message}\n// Please regenerate this script manually`;
                    }
                }
            }
            
            console.log(`Script generation completed. Generated ${Object.keys(scripts).length} scripts.`);
            return scripts;
            
        } catch (error) {
            console.error("Critical error in script generation:", error);
            throw new Error(`Unable to generate scripts: ${error.message}`);
        }
    }

    async generateContentWithRetry(prompt, role, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Generating script content (attempt ${attempt}/${maxRetries}):`, role);
                
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
                    console.log(`Script content generated successfully`);
                    return response.content;
                } else {
                    throw new Error('Invalid response format');
                }
                
            } catch (error) {
                lastError = error;
                console.error(`Script generation attempt ${attempt} failed:`, error);
                
                if (attempt < maxRetries) {
                    console.log(`Retrying in 2 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.error(`All ${maxRetries} attempts failed`);
                }
            }
        }
        
        throw new Error(`Failed to generate script content after ${maxRetries} attempts: ${lastError.message}`);
    }

    async generateContent(prompt, role) {
        return this.generateContentWithRetry(prompt, role);
    }
}