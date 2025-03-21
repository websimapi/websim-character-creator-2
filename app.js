import mouseTracker from './mouseTracker.js';
import madLibsGenerator from './madLibsGenerator.js';
import characterGenerator from './characterGenerator.js';
import { config } from './config.js';

const { useState, useEffect, useRef } = React;

const App = () => {
    const [step, setStep] = useState('welcome');
    const [isTracking, setIsTracking] = useState(false);
    const [madLibs, setMadLibs] = useState(null);
    const [madLibsInputs, setMadLibsInputs] = useState({});
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [characterCount, setCharacterCount] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]);
    const [wordGrid, setWordGrid] = useState([]);
    const trackingAreaRef = useRef(null);

    useEffect(() => {
        // Initialize character count from storage
        setCharacterCount(characterGenerator.getCharacterCount());

        // Generate word grid
        generateWordGrid();

        // Initialize room socket connection for multiplayer
        const room = new WebsimSocket();
    }, []);

    const generateWordGrid = () => {
        const gridSize = config.wordGridSize;
        const totalCells = gridSize * gridSize;
        const grid = [];

        // Collect all words from categories
        const allWords = [];
        for (const category in config.wordCategories) {
            config.wordCategories[category].forEach(word => {
                allWords.push({ word, category });
            });
        }

        // Shuffle and pick words for the grid
        for (let i = 0; i < totalCells; i++) {
            const randomIndex = Math.floor(Math.random() * allWords.length);
            grid.push(allWords[randomIndex]);
            allWords.splice(randomIndex, 1);

            // If we run out of words, refill the array
            if (allWords.length === 0) {
                for (const category in config.wordCategories) {
                    config.wordCategories[category].forEach(word => {
                        allWords.push({ word, category });
                    });
                }
            }
        }

        setWordGrid(grid);
    };

    const handleMouseMove = (e) => {
        if (isTracking && trackingAreaRef.current) {
            const rect = trackingAreaRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mouseTracker.addPoint(x, y);

            // Check if hovering over a grid cell
            if (e.buttons === 1) { // If mouse button is pressed
                const gridSize = config.wordGridSize;
                const cellWidth = rect.width / gridSize;
                const cellHeight = rect.height / gridSize;

                const gridX = Math.floor(x / cellWidth);
                const gridY = Math.floor(y / cellHeight);

                if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
                    const index = gridY * gridSize + gridX;
                    const wordData = wordGrid[index];

                    if (wordData && !selectedWords.some(w => w.word === wordData.word)) {
                        setSelectedWords([...selectedWords, wordData]);
                    }
                }
            }
        }
    };

    const startTracking = () => {
        setIsTracking(true);
        setSelectedWords([]);
        mouseTracker.startTracking();
    };

    const stopTracking = async () => {
        setIsTracking(false);
        const points = mouseTracker.stopTracking();

        // Generate movement characteristics for character generation later
        const movementCharacteristics = mouseTracker.getMovementCharacteristics();
        mouseTracker.movementCharacteristics = movementCharacteristics;

        if (selectedWords.length === 0) {
            setError("Please select some words by holding the mouse button while moving");
            return;
        }

        setLoading(true);
        try {
            // Use the selected words and LLM to generate a Mad Libs story
            const words = selectedWords.map(w => w.word).join(', ');
            const categories = [...new Set(selectedWords.map(w => w.category))].join(', ');

            // Generate a Mad Libs story using LLM
            const storyPrompt = `
                Create a short, fun fantasy adventure story (3-4 sentences) using these words: ${words}.
                Include concepts from these categories: ${categories}.
                Make it suitable for a game character backstory.
            `;

            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a creative story generator for a game. Create a short, engaging story using the provided words."
                    },
                    {
                        role: "user",
                        content: storyPrompt
                    }
                ]
            });

            const story = completion.content;

            // Use LLM to identify parts of speech in the story for Mad Libs
            const partsOfSpeechPrompt = `
                Identify 5-8 words in this story that could be replaced with blanks for a Mad Libs game.
                For each word, provide the part of speech (noun, verb, adjective, etc.)
                Format your response as a JSON array like this:
                [
                    {"word": "magical", "replacement": "adjective", "index": 4},
                    {"word": "castle", "replacement": "noun", "index": 7}
                ]
                where index is the position of the word in the story.
            `;

            const partsOfSpeechCompletion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You analyze text and identify parts of speech for Mad Libs games."
                    },
                    {
                        role: "user",
                        content: story + "\n\n" + partsOfSpeechPrompt
                    }
                ],
                json: true
            });

            let replacements = [];
            try {
                replacements = JSON.parse(partsOfSpeechCompletion.content);
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                replacements = [];
            }

            // Generate Mad Libs with the identified replacements
            const generatedMadLibs = madLibsGenerator.generateMadLibsFromStory(story, replacements, selectedWords);
            setMadLibs(generatedMadLibs);

            // Initialize empty inputs for each form field
            const initialInputs = {};
            generatedMadLibs.formFields.forEach(field => {
                initialInputs[field.id] = '';
            });
            setMadLibsInputs(initialInputs);

            setStep('madlibs');
        } catch (err) {
            setError('Failed to generate story: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (fieldId, value) => {
        setMadLibsInputs({
            ...madLibsInputs,
            [fieldId]: value
        });
    };

    const handleMadLibsSubmit = async (e) => {
        e.preventDefault();

        // Check if all fields are filled
        const allFilled = Object.values(madLibsInputs).every(value => value.trim() !== '');
        if (!allFilled) {
            setError('Please fill in all the fields!');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fill in the Mad Libs story with user inputs
            const filledMadLibs = madLibsGenerator.fillMadLibs(madLibs, madLibsInputs);

            // Generate character based on the story and mouse movement
            const generatedCharacter = await characterGenerator.generateCharacter(
                filledMadLibs, 
                madLibsInputs,
                mouseTracker.movementCharacteristics || ['default', 'character']
            );

            // Process the image for the game (remove background, etc.)
            generatedCharacter.processedUrl = await characterGenerator.processImageForGame(
                generatedCharacter.characterUrl
            );

            setCharacter(generatedCharacter);
            setStep('character');
        } catch (err) {
            setError('Failed to generate character: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveCharacter = async () => {
        try {
            // Save character to storage and database
            await characterGenerator.saveCharacter(character);

            // Update character count
            const newCount = characterGenerator.getCharacterCount();
            setCharacterCount(newCount);

            // Reset and go back to welcome screen
            setStep('welcome');
            setCharacter(null);
            setMadLibs(null);
            setMadLibsInputs({});
        } catch (err) {
            setError('Failed to save character: ' + err.message);
        }
    };

    const canCreateNewCharacter = characterCount < config.freeCharacterLimit;

    return (
        <div className="app-container">
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            {step === 'welcome' && (
                <div className="welcome-screen">
                    <h1>Character Creator</h1>
                    <p>Create unique characters for your game adventure!</p>
                    <p>Characters created: {characterCount} / {config.freeCharacterLimit} free characters</p>

                    {canCreateNewCharacter ? (
                        <>
                            <p>Move your mouse randomly in the area below, hold click to collect words, then release to create your character!</p>
                            <div 
                                className="mouse-tracking-area" 
                                ref={trackingAreaRef}
                                onMouseMove={handleMouseMove}
                                onMouseDown={startTracking}
                                onMouseUp={stopTracking}
                            >
                                {isTracking ? (
                                    <>
                                        <p>Hold click and move to collect words. Release when done.</p>
                                        <div className="word-grid">
                                            {wordGrid.map((cell, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`word-grid-cell ${config.wordGridVisible ? 'visible' : ''} ${selectedWords.some(w => w.word === cell.word) ? 'selected' : ''}`}
                                                >
                                                    {cell.word}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p>Click and move your mouse to start collecting words</p>
                                )}
                            </div>

                            {selectedWords.length > 0 && (
                                <div className="selected-words">
                                    {selectedWords.map((wordData, index) => (
                                        <span key={index} className="selected-word">
                                            {wordData.word}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>You've used all your free character creations. Unlock more in the game!</p>
                    )}
                </div>
            )}

            {step === 'madlibs' && madLibs && (
                <div className="madlibs-screen">
                    <h1>Create Your Character</h1>
                    <h2>{madLibs.title} Mad Libs</h2>

                    <form className="madlibs-form" onSubmit={handleMadLibsSubmit}>
                        {madLibs.formFields.map(field => (
                            <div key={field.id} className="form-group">
                                <label htmlFor={field.id}>{field.label}</label>
                                <input
                                    type="text"
                                    id={field.id}
                                    value={madLibsInputs[field.id] || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    required
                                />
                            </div>
                        ))}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Generating...' : 'Create Character'}
                        </button>
                    </form>
                </div>
            )}

            {step === 'character' && character && (
                <div className="character-screen">
                    <h1>Your Character</h1>

                    <div className="character-display">
                        <img src={character.backgroundUrl} alt="Character background" className="character-background" />
                        <img src={character.processedUrl || character.characterUrl} alt="Generated character" className="character-foreground" />

                        <div className="character-story">
                            <h2>Character Story</h2>
                            <div className="madlibs-story" dangerouslySetInnerHTML={{ __html: madLibsGenerator.fillMadLibs(madLibs, madLibsInputs).filledText }}></div>
                        </div>

                        <button onClick={saveCharacter}>Save Character</button>
                        <button onClick={() => setStep('madlibs')}>Try Again</button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Generating your character...</p>
                </div>
            )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('app'));