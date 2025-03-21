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
    `,
    
    characterCirclePromptInstructions: `
        Create a character with these characteristics:
        - ALWAYS be a perfect circle shape
        - ALWAYS have a face with expressions
        - ALWAYS have no legs, no feet, and no hands
        - ALWAYS be on a pure transparent background
        
        Generate an image of just this character that looks cute, simple, and suitable for a 2D game.
    `,
    
    backgroundPromptInstructions: `
        Create a simple background scene based on the story, with these characteristics:
        - Simple, minimal design that won't overpower a character
        - Either a white or solid black background, nothing else
        - Suitable for a 2D game
        
        Generate an image of just this background.
    `,
    
    // Word grid configuration
    wordGridSize: 5, 
    wordGridVisible: false, 
    
    // Word categories for the grid
    wordCategories: {
        nouns: ['castle', 'dragon', 'wizard', 'potion', 'sword', 'crystal', 'hero', 'monster', 'queen', 'king', 'diamond', 'treasure', 'unicorn', 'spell', 'ghost'],
        verbs: ['run', 'fly', 'cast', 'fight', 'create', 'destroy', 'transform', 'heal', 'jump', 'dance', 'sing', 'escape', 'conquer', 'swim', 'dive'],
        adjectives: ['magical', 'ancient', 'glowing', 'mystical', 'powerful', 'enchanted', 'mysterious', 'gigantic', 'tiny', 'colorful', 'brave', 'clever', 'fierce', 'gentle', 'wise'],
        places: ['forest', 'mountain', 'cave', 'castle', 'village', 'island', 'kingdom', 'dungeon', 'palace', 'tower', 'lake', 'valley', 'temple', 'ruins', 'garden']
    },
};