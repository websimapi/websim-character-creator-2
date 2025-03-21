import { config } from './config.js';

class CharacterGenerator {
    constructor() {
        this.llmPromptTemplate = config.characterPromptInstructions;
    }
    
    async generateCharacter(madLibsStory, inputs) {
        try {
            // Prepare the prompt for the LLM
            const storyKeywords = Object.values(inputs).join(', ');
            const storyText = madLibsStory.filledText.replace(/<[^>]*>/g, '');
            
            const prompt = `
                Create a character based on this Mad Libs story:
                
                ${storyText}
                
                Keywords: ${storyKeywords}
                
                ${this.llmPromptTemplate}
            `;
            
            // Generate the character image
            const result = await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1"
            });
            
            return {
                url: result.url,
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

