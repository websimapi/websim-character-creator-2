export const config = {
    // Maximum number of points to track in mouse movement
    maxMousePoints: 100,
    
    // Generic keywords that can be used in the story
    genericKeywords: [
        'adventure', 'magic', 'space', 'ocean', 'forest', 'mountain', 'desert',
        'futuristic', 'ancient', 'mythical', 'robot', 'wizard', 'warrior', 'explorer',
        'inventor', 'detective', 'superhero', 'villain', 'alien', 'creature',
        'journey', 'quest', 'mission', 'discovery', 'treasure', 'mystery', 'secret',
        'power', 'transformation', 'battle', 'friendship', 'betrayal', 'survival'
    ],
    
    // Parts of speech for Mad Libs
    partsOfSpeech: [
        'noun', 'verb', 'adjective', 'adverb', 'color', 'animal', 'place',
        'food', 'emotion', 'number', 'body-part', 'sound', 'object'
    ],
    
    // Number of free characters a user can create
    freeCharacterLimit: 1,
    
    // Character generation prompt constants
    characterPromptInstructions: `
        Create a character based on the following Mad Libs input. The character MUST follow these rules:
        - ALWAYS be a circle shape
        - ALWAYS have no legs, no feet, and no hands
        - ALWAYS be in a scene with a white or black solid background, nothing else
        
        Generate an image of this character that looks cute, simple, and suitable for a 2D game.
    `
};

