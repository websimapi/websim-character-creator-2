import { config } from './config.js';

class CharacterGenerator {
    constructor() {
        this.llmPromptTemplate = config.characterPromptInstructions;
        this.circlePromptTemplate = config.characterCirclePromptInstructions;
        this.backgroundPromptTemplate = config.backgroundPromptInstructions;
    }
    
    async generateCharacter(madLibsStory, inputs, mouseData) {
        try {
            // Get the original story and user's filled inputs
            const storyText = madLibsStory.originalStory || madLibsStory.text;
            const userInputs = Object.values(inputs).join(', ');
            const selectedWords = madLibsStory.selectedWords ? 
                madLibsStory.selectedWords.map(w => w.word).join(', ') : '';
            
            // Generate background based on the filled story
            const filledStory = madLibsStory.filledText || this.fillMadLibsLocally(madLibsStory, inputs);
            const cleanFilledStory = filledStory.replace(/<[^>]*>/g, '');
            
            // Generate detailed scene description using LLM
            const scenePrompt = `
                Based on this story:
                "${cleanFilledStory}"
                
                Create a detailed description of the scene/background (1-2 paragraphs). 
                Focus on the environment, weather, time of day, and atmosphere.
                Don't describe any characters, just the setting.
            `;
            
            const sceneCompletion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a creative scene designer for a 2D game. Create vivid background descriptions."
                    },
                    {
                        role: "user",
                        content: scenePrompt
                    }
                ]
            });
            
            const sceneDescription = sceneCompletion.content;
            
            // Generate background image based on scene description
            const backgroundPrompt = `
                Create a background based on this scene description:
                
                ${sceneDescription}
                
                ${this.backgroundPromptTemplate}
            `;
            
            const backgroundResult = await websim.imageGen({
                prompt: backgroundPrompt,
                aspect_ratio: "16:9"
            });
            
            // Generate character image based on mouse movement
            const characterPrompt = `
                Create a character with these traits:
                Movement pattern: ${mouseData.join(', ')}
                Word influences: ${selectedWords}
                
                ${this.circlePromptTemplate}
            `;
            
            const characterResult = await websim.imageGen({
                prompt: characterPrompt,
                aspect_ratio: "1:1"
            });
            
            return {
                characterUrl: characterResult.url,
                backgroundUrl: backgroundResult.url,
                story: cleanFilledStory,
                sceneDescription: sceneDescription,
                keywords: userInputs,
                inputs: inputs
            };
        } catch (error) {
            console.error('Error generating character:', error);
            throw error;
        }
    }
    
    fillMadLibsLocally(template, userInputs) {
        let filledText = template.text;
        
        for (const [placeholder, value] of Object.entries(userInputs)) {
            const type = placeholder.split('-')[0];
            const regex = new RegExp(`\\[${type}\\]`, 'g');
            filledText = filledText.replace(regex, `<span class="highlight">${value}</span>`);
        }
        
        return filledText;
    }
    
    async processImageForGame(imageUrl) {
        try {
            // Create a temporary image element to load the character image
            const img = new Image();
            
            // Wait for the image to load
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.crossOrigin = "Anonymous"; // Enable CORS for the image
                img.src = imageUrl;
            });
            
            // Create an offscreen canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Sample the corners to determine background color
            const cornerSamples = [
                this.getPixelAt(data, 0, 0, canvas.width),                        // Top-left
                this.getPixelAt(data, canvas.width - 1, 0, canvas.width),         // Top-right
                this.getPixelAt(data, 0, canvas.height - 1, canvas.width),        // Bottom-left
                this.getPixelAt(data, canvas.width - 1, canvas.height - 1, canvas.width)  // Bottom-right
            ];
            
            // Calculate average background color from corners
            const bgColor = {
                r: Math.round(cornerSamples.reduce((sum, pixel) => sum + pixel.r, 0) / cornerSamples.length),
                g: Math.round(cornerSamples.reduce((sum, pixel) => sum + pixel.g, 0) / cornerSamples.length),
                b: Math.round(cornerSamples.reduce((sum, pixel) => sum + pixel.b, 0) / cornerSamples.length)
            };
            
            // Replace background with transparency
            // Using color similarity threshold for better results
            const threshold = 30; // Adjust this value as needed for better background detection
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate color difference
                const diff = Math.sqrt(
                    Math.pow(r - bgColor.r, 2) +
                    Math.pow(g - bgColor.g, 2) +
                    Math.pow(b - bgColor.b, 2)
                );
                
                // If the color is similar to the background color, make it transparent
                if (diff < threshold) {
                    data[i + 3] = 0; // Set alpha to 0 (transparent)
                }
            }
            
            // Update the canvas with the processed image data
            ctx.putImageData(imageData, 0, 0);
            
            // Convert the canvas to a data URL
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error processing image:', error);
            return imageUrl; // Return original image if processing fails
        }
    }

    // Helper function to get pixel data at specific coordinates
    getPixelAt(data, x, y, width) {
        const idx = (y * width + x) * 4;
        return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
        };
    }
    
    saveCharacter(characterData) {
        // Save to local storage
        let savedCharacters = JSON.parse(localStorage.getItem('gameCharacters') || '[]');
        savedCharacters.push(characterData);
        localStorage.setItem('gameCharacters', JSON.stringify(savedCharacters));
        
        return savedCharacters.length;
    }
    
    getCharacterCount() {
        const savedCharacters = JSON.parse(localStorage.getItem('gameCharacters') || '[]');
        return savedCharacters.length;
    }
}

export default new CharacterGenerator();