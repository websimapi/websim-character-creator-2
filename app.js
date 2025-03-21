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
    const trackingAreaRef = useRef(null);
    
    useEffect(() => {
        // Initialize character count from storage
        setCharacterCount(characterGenerator.getCharacterCount());
        
        // Initialize room socket connection for multiplayer
        const room = new WebsimSocket();
    }, []);
    
    const handleMouseMove = (e) => {
        if (isTracking && trackingAreaRef.current) {
            const rect = trackingAreaRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mouseTracker.addPoint(x, y);
        }
    };
    
    const startTracking = () => {
        setIsTracking(true);
        mouseTracker.startTracking();
    };
    
    const stopTracking = () => {
        setIsTracking(false);
        const points = mouseTracker.stopTracking();
        const keywords = mouseTracker.getKeywordsFromMovement();
        const movementCharacteristics = mouseTracker.getMovementCharacteristics();
        
        // Store movement characteristics for character generation later
        mouseTracker.movementCharacteristics = movementCharacteristics;
        
        // Generate Mad Libs using the keywords
        const generatedMadLibs = madLibsGenerator.generateMadLibs(keywords);
        setMadLibs(generatedMadLibs);
        
        // Initialize empty inputs for each form field
        const initialInputs = {};
        generatedMadLibs.formFields.forEach(field => {
            initialInputs[field.id] = '';
        });
        setMadLibsInputs(initialInputs);
        
        setStep('madlibs');
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
                            <p>Move your mouse randomly in the area below, then click to start creating your character!</p>
                            <div 
                                className="mouse-tracking-area" 
                                ref={trackingAreaRef}
                                onMouseMove={handleMouseMove}
                                onMouseDown={startTracking}
                                onMouseUp={stopTracking}
                            >
                                {isTracking ? "Click to finish tracking" : "Click and move your mouse randomly"}
                            </div>
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