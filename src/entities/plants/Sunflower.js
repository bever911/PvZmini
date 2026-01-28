/**
 * Sunflower - Generates sun every 20 seconds
 * 
 * Cost: 50 sun
 * Health: 100
 * Ability: Produces 25 sun every 20 seconds
 */
class Sunflower extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 100,
            type: 'Sunflower',
            emoji: '🌻',
            color: 0xffff00
        });
        
        // Sunflower-specific properties
        this.sunProductionInterval = 20000; // 20 seconds
        this.sunProductionAmount = 25;
        
        // Start producing sun
        this.startSunProduction();
    }

    /**
     * Start the sun production cycle
     */
    startSunProduction() {
        // Produce sun every 20 seconds
        this.sunProductionTimer = this.scene.time.addEvent({
            delay: this.sunProductionInterval,
            callback: this.produceSun,
            callbackScope: this,
            loop: true
        });
        
        console.log('Sunflower started producing sun');
    }

    /**
     * Produce a sun
     */
    produceSun() {
        if (this.isDead) return;
        
        // Spawn sun at this sunflower's position
        this.scene.sunManager.spawnSunAtPosition(this.x, this.y);
        
        // Small animation when producing sun
        this.scene.tweens.add({
            targets: this.visual,
            scale: { from: 1, to: 1.2 },
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
        
        console.log('Sunflower produced sun!');
    }

    /**
     * Clean up timers when destroyed
     */
    destroy(fromScene) {
        if (this.sunProductionTimer) {
            this.sunProductionTimer.remove();
        }
        super.destroy(fromScene);
    }
}

// Static properties for UI
Sunflower.cost = 50;
Sunflower.displayName = 'Sunflower';
Sunflower.description = 'Produces sun';
