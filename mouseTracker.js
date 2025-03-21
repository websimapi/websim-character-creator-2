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
    
    getMovementCharacteristics() {
        // Get movement characteristics for character generation
        const entropy = this.getEntropy();
        const movements = [];
        
        if (this.points.length < 5) return ['calm', 'simple'];
        
        // Analyze movement patterns
        let totalDistance = 0;
        let maxSpeed = 0;
        let avgDirection = 0;
        let directionChanges = 0;
        
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i-1];
            const curr = this.points[i];
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            totalDistance += distance;
            maxSpeed = Math.max(maxSpeed, distance);
            
            if (i > 1) {
                const prevAngle = Math.atan2(prev.y - this.points[i-2].y, prev.x - this.points[i-2].x);
                const angleDiff = Math.abs(angle - prevAngle);
                if (angleDiff > 0.5) directionChanges++;
                avgDirection += angleDiff;
            }
        }
        
        avgDirection /= (this.points.length - 2);
        
        // Determine movement characteristics
        if (totalDistance > 1000) movements.push('energetic');
        else if (totalDistance < 300) movements.push('subtle');
        else movements.push('moderate');
        
        if (maxSpeed > 50) movements.push('fast');
        else if (maxSpeed < 10) movements.push('slow');
        else movements.push('steady');
        
        if (directionChanges > 10) movements.push('erratic');
        else if (directionChanges < 3) movements.push('direct');
        else movements.push('flowing');
        
        if (avgDirection > 1) movements.push('expressive');
        else if (avgDirection < 0.3) movements.push('focused');
        else movements.push('balanced');
        
        return movements;
    }
}

export default new MouseTracker();