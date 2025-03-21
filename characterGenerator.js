import { config } from './config.js';

class CharacterGenerator {
    constructor() {
        this.llmPromptTemplate = config.characterPromptInstructions;
        this.circlePromptTemplate = config.characterCirclePromptInstructions;
        this.backgroundPromptTemplate = config.backgroundPromptInstructions;
    }
    
    async generateCharacter(madLibsStory, inputs, mouseData) {
        try {
            // Prepare the prompts for the LLM
            const storyKeywords = Object.values(inputs).join(', ');
            const storyText = madLibsStory.filledText.replace(/<[^>]*>/g, '');
            
            // Generate the character image based on mouse movement
            const characterPrompt = `
                Create a character with these traits:
                Movement pattern: ${mouseData.join(', ')}
                
                ${this.circlePromptTemplate}
            `;
            
            const characterResult = await websim.imageGen({
                prompt: characterPrompt,
                aspect_ratio: "1:1"
            });
            
            // Generate the background image based on Mad Libs
            const backgroundPrompt = `
                Create a background based on this Mad Libs story:
                
                ${storyText}
                
                Keywords: ${storyKeywords}
                
                ${this.backgroundPromptTemplate}
            `;
            
            const backgroundResult = await websim.imageGen({
                prompt: backgroundPrompt,
                aspect_ratio: "16:9"
            });
            
            return {
                characterUrl: characterResult.url,
                backgroundUrl: backgroundResult.url,
                story: storyText,
                keywords: storyKeywords,
                inputs: inputs
            };
        } catch (error) {
            console.error('Error generating character:', error);
            throw error;
        }
    }
    
    async processImageForGame(imageUrl) {
        // In a real implementation, this would process the image to remove background
        // For now, we'll just return the original image
        return imageUrl;
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