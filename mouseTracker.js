import { config } from './config.js';

class MouseTracker {
    constructor() {
        this.points = [];
        this.isTracking = false;
        this.maxPoints = config.maxMousePoints;
    }
    
    startTracking() {
        this.points = [];
        this.isTracking = true;
    }
    
    stopTracking() {
        this.isTracking = false;
        return this.points;
    }
    
    addPoint(x, y) {
        if (!this.isTracking) return;
        
        this.points.push({ x, y });
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }
    
    getEntropy() {
        if (this.points.length < 5) return 0;
        
        // Calculate movement entropy (randomness)
        let entropy = 0;
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i-1];
            const curr = this.points[i];
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            entropy += distance * (Math.abs(angle) / Math.PI);
        }
        
        return entropy / this.points.length;
    }
    
    getKeywordsFromMovement() {
        const entropy = this.getEntropy();
        const keywords = [];
        
        // Select keywords based on mouse movement patterns
        if (entropy > 0.8) {
            keywords.push('chaotic', 'wild', 'unpredictable');
        } else if (entropy > 0.5) {
            keywords.push('energetic', 'lively', 'dynamic');
        } else if (entropy > 0.3) {
            keywords.push('balanced', 'moderate', 'steady');
        } else {
            keywords.push('calm', 'precise', 'methodical');
        }
        
        // Add some random keywords from the config
        const availableKeywords = [...config.genericKeywords];
        for (let i = 0; i < 3; i++) {
            if (availableKeywords.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableKeywords.length);
            keywords.push(availableKeywords[randomIndex]);
            availableKeywords.splice(randomIndex, 1);
        }
        
        return keywords;
    }
}

export default new MouseTracker();

