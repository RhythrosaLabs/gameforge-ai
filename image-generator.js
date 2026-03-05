import config from './config.js';

export class ImageGenerator {
    constructor() {
        this.updateStatus = null;
    }

    setStatusUpdater(updateFn) {
        this.updateStatus = updateFn;
    }

    async generateImages(gameConcept, customization) {
        const images = {};
        let imageCount = 0;
        const totalImages = customization.imageTypes.reduce((sum, type) => sum + customization.imageCounts[type], 0);
        
        try {
            console.log(`Starting image generation for ${totalImages} total images`);
            
            // For each image type with enhanced prompts
            for (const type of customization.imageTypes) {
                console.log(`Generating ${customization.imageCounts[type]} images for type: ${type}`);
                
                for (let i = 0; i < customization.imageCounts[type]; i++) {
                    imageCount++;
                    
                    // Update progress for each image
                    if (this.updateStatus) {
                        this.updateStatus(
                            "Creating professional game artwork...", 
                            0.5 + (imageCount / totalImages) * 0.15, 
                            `Generating ${type} ${i + 1} of ${customization.imageCounts[type]}`
                        );
                    }
                    
                    // Retry mechanism for image generation
                    let attempts = 0;
                    let imageResult = null;
                    const maxAttempts = 3;
                    
                    while (attempts < maxAttempts && !imageResult) {
                        attempts++;
                        try {
                            console.log(`Generating image ${imageCount}/${totalImages} (${type} ${i + 1}) - Attempt ${attempts}`);
                            
                            const basePrompt = config.prompts.imagePrompts[type];
                            const contextPrompt = `Game Context: ${gameConcept}`;
                            const variationPrompt = i > 0 ? `Variation ${i + 1}: Focus on different ${type === 'Character' ? 'equipment and pose' : type === 'Enemy' ? 'abilities and appearance' : type === 'Background' ? 'time of day and weather' : 'functionality and design'}.` : '';
                            
                            const fullPrompt = `${basePrompt} ${contextPrompt} ${variationPrompt}`;
                            
                            // Parse width/height from config.imageSizes (e.g., "1024x1792")
                            let width, height;
                            const sizeStr = config.imageSizes[type];
                            if (sizeStr && sizeStr.includes('x')) {
                                const [w, h] = sizeStr.split('x').map(n => parseInt(n.trim(), 10));
                                if (!isNaN(w) && !isNaN(h)) {
                                    width = w; height = h;
                                }
                            }
                            
                            imageResult = await websim.imageGen({
                                prompt: fullPrompt,
                                ...(width && height ? { width, height } : {}),
                                transparent: type !== 'Background'
                            });
                            
                            // Verify the image URL is valid
                            if (imageResult && imageResult.url) {
                                images[`${type.toLowerCase()}_image_${i + 1}`] = imageResult.url;
                                console.log(`Image generated successfully: ${type.toLowerCase()}_image_${i + 1}`);
                                
                                // Convert to 3D with better context
                                if (customization.useReplicate.convertTo3D && type !== 'Background') {
                                    try {
                                        const threeDModel = await this.convertImageTo3D(imageResult.url, `${type} from ${gameConcept}`, type);
                                        images[`${type.toLowerCase()}_3d_model_${i + 1}`] = threeDModel;
                                        console.log(`3D model generated successfully: ${type.toLowerCase()}_3d_model_${i + 1}`);
                                    } catch (error) {
                                        console.warn(`3D conversion failed for ${type} ${i + 1}:`, error);
                                    }
                                }
                                
                                // Break out of retry loop on success
                                break;
                            } else {
                                throw new Error('Invalid image result - no URL returned');
                            }
                            
                        } catch (error) {
                            console.warn(`Image generation attempt ${attempts} failed for ${type} ${i + 1}:`, error);
                            
                            if (attempts >= maxAttempts) {
                                console.error(`Failed to generate image for ${type} ${i + 1} after ${maxAttempts} attempts`);
                                // Create a placeholder entry
                                images[`${type.toLowerCase()}_image_${i + 1}`] = 'placeholder';
                            } else {
                                // Wait before retry
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                        }
                    }
                }
            }
            
            console.log(`Image generation completed. Generated ${Object.keys(images).length} images.`);
            return images;
            
        } catch (error) {
            console.error("Critical error in image generation:", error);
            throw new Error(`Unable to generate high-quality images: ${error.message}`);
        }
    }

    async convertImageTo3D(imageUrl, description, type) {
        try {
            // Generate a proper 3D model representation based on the original image
            const threeDPrompt = `Convert this 2D image to a detailed 3D model: ${description}. Create a realistic 3D representation with proper depth, dimension, and structure. The model should be suitable for game engines with clean topology, proper proportions, and game-ready optimization. Show the model from an isometric view with good lighting and materials.`;
            
            const threeDResult = await websim.imageGen({
                prompt: threeDPrompt,
                // square output for previews
                width: 1024,
                height: 1024,
            });
            
            return threeDResult.url;
            
        } catch (error) {
            console.error("Error converting image to 3D:", error);
            throw new Error(`Unable to convert image to 3D: ${error.message}`);
        }
    }
}