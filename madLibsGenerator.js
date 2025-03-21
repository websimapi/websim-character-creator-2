import { config } from './config.js';

class MadLibsGenerator {
    constructor() {
        this.templates = [
            {
                title: "Space Adventure",
                text: "In the [adjective] depths of space, a [adjective] [noun] named [noun] embarked on a [adjective] journey to the [noun] planet. Armed with only a [adjective] [noun] and [number] units of [noun], they encountered a [adjective] [noun] that could [verb] at incredible speeds. After [verb-ing] for [number] [time-unit], they discovered a secret [noun] that would change the [noun] forever."
            },
            {
                title: "Magical Forest",
                text: "Deep within the [adjective] forest of [place], there lived a [adjective] [noun] with the power to [verb] any [noun] they touched. One [adjective] day, while [verb-ing] near the [adjective] river, they found a [adjective] [noun] that glowed with [color] light. Suddenly, [number] [noun]s appeared and began to [verb] around them, creating a [adjective] scene that no one would ever forget."
            },
            {
                title: "Underwater Mystery",
                text: "Beneath the [adjective] ocean waves, a [adjective] [noun] was swimming when they noticed a [adjective] [noun] glimmering in the distance. As they [verb-ed] closer, [number] [adjective] [noun]s emerged from a hidden [place]. They were all [verb-ing] around a mysterious [noun] that seemed to [verb] with [adjective] energy. The [noun] decided to [verb] it, causing a [adjective] reaction that transformed the entire [place]."
            }
        ];
    }
    
    generateMadLibs(keywords) {
        // Select a random template
        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        
        // Find all placeholders [word-type]
        const placeholderRegex = /\[(.*?)\]/g;
        const placeholders = [];
        let match;
        
        while ((match = placeholderRegex.exec(template.text)) !== null) {
            placeholders.push(match[1]);
        }
        
        // Create unique placeholders (no duplicates)
        const uniquePlaceholders = [...new Set(placeholders)];
        
        // Create the form fields
        const formFields = uniquePlaceholders.map(placeholder => ({
            id: placeholder + "-" + Math.floor(Math.random() * 1000),
            type: placeholder,
            label: `Enter a ${placeholder.replace(/-/g, ' ')}:`
        }));
        
        return {
            title: template.title,
            text: template.text,
            formFields: formFields,
            keywords: keywords
        };
    }
    
    fillMadLibs(template, userInputs) {
        let filledText = template.text;
        
        // Replace each placeholder with user input
        for (const [placeholder, value] of Object.entries(userInputs)) {
            const type = placeholder.split('-')[0];
            const regex = new RegExp(`\\[${type}\\]`, 'g');
            filledText = filledText.replace(regex, `<span class="highlight">${value}</span>`);
        }
        
        return {
            title: template.title,
            filledText: filledText
        };
    }
}

export default new MadLibsGenerator();

