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
        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        
        const placeholderRegex = /\[(.*?)\]/g;
        const placeholders = [];
        let match;
        
        while ((match = placeholderRegex.exec(template.text)) !== null) {
            placeholders.push(match[1]);
        }
        
        const uniquePlaceholders = [...new Set(placeholders)];
        
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
    
    generateMadLibsFromStory(story, replacements, selectedWords) {
        let madLibsText = story;
        const formFields = [];
        
        replacements.sort((a, b) => b.index - a.index);
        
        replacements.forEach(replacement => {
            const placeholder = `[${replacement.replacement}]`;
            const words = story.split(' ');
            
            let foundIndex = -1;
            for (let i = 0; i < words.length; i++) {
                const cleanWord = words[i].replace(/[.,!?;:'"-]/g, '').toLowerCase();
                if (cleanWord === replacement.word.toLowerCase()) {
                    if (foundIndex === -1 || i === replacement.index) {
                        foundIndex = i;
                        if (i === replacement.index) break;
                    }
                }
            }
            
            if (foundIndex >= 0) {
                const punctuation = words[foundIndex].match(/[.,!?;:'"-]/g) || [];
                words[foundIndex] = placeholder + punctuation.join('');
                madLibsText = words.join(' ');
                
                formFields.push({
                    id: replacement.replacement + "-" + Math.floor(Math.random() * 1000),
                    type: replacement.replacement,
                    label: `Enter a ${replacement.replacement.replace(/-/g, ' ')}:`,
                    originalWord: replacement.word
                });
            }
        });
        
        let title = "Character Story";
        if (selectedWords.length > 0) {
            const titleWords = [];
            const maxTitleWords = Math.min(3, selectedWords.length);
            const wordsCopy = [...selectedWords];
            
            for (let i = 0; i < maxTitleWords; i++) {
                const randomIndex = Math.floor(Math.random() * wordsCopy.length);
                titleWords.push(wordsCopy[randomIndex].word);
                wordsCopy.splice(randomIndex, 1);
            }
            
            title = titleWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        
        return {
            title: title,
            text: madLibsText,
            formFields: formFields,
            originalStory: story,
            selectedWords: selectedWords
        };
    }
    
    fillMadLibs(template, userInputs) {
        let filledText = template.text;
        
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