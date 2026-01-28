/**
 * SunManager - Manages sun spawning and collection
 * 
 * Features:
 * - Spawns sun from sky every 8 seconds
 * - Tracks all active sun objects
 * - Random spawn positions along top of screen
 * - Random landing positions within lawn area
 */
class SunManager {
    constructor(scene) {
        this.scene = scene;
        this.activeSuns = [];
        this.spawnInterval = 8000; // 8 seconds in milliseconds
        this.spawnTimer = null;
        
        // Spawn area boundaries (within lawn grid)
        this.spawnArea = {
            minX: 250,
            maxX: 1250,
            minY: 200,
            maxY: 600
        };
        
        console.log('SunManager initialized');
    }

    /**
     * Start spawning sun automatically
     */
    start() {
        // Spawn first sun after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            this.spawnSun();
        });
        
        // Then spawn every 8 seconds
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnInterval,
            callback: this.spawnSun,
            callbackScope: this,
            loop: true
        });
        
        console.log('SunManager started - spawning sun every', this.spawnInterval / 1000, 'seconds');
    }

    /**
     * Stop spawning sun
     */
    stop() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
        console.log('SunManager stopped');
    }

    /**
     * Spawn a single sun from the sky
     */
    spawnSun() {
        // Random X position along the top
        const spawnX = Phaser.Math.Between(this.spawnArea.minX, this.spawnArea.maxX);
        const spawnY = 0; // Start above screen
        
        // Random landing Y position within lawn
        const targetY = Phaser.Math.Between(this.spawnArea.minY, this.spawnArea.maxY);
        
        // Create sun
        const sun = new Sun(this.scene, spawnX, spawnY, targetY);
        this.activeSuns.push(sun);
        
        // Remove from active list when destroyed
        sun.on('destroy', () => {
            const index = this.activeSuns.indexOf(sun);
            if (index > -1) {
                this.activeSuns.splice(index, 1);
            }
        });
        
        console.log('Sun spawned at', spawnX, '- landing at Y:', targetY);
    }

    /**
     * Manually spawn sun at specific position (for sunflower plants later)
     */
    spawnSunAtPosition(x, y) {
        const sun = new Sun(this.scene, x, y - 50, y);
        this.activeSuns.push(sun);
        
        sun.on('destroy', () => {
            const index = this.activeSuns.indexOf(sun);
            if (index > -1) {
                this.activeSuns.splice(index, 1);
            }
        });
        
        console.log('Sun spawned at position:', x, y);
    }

    /**
     * Get count of active sun objects
     */
    getActiveSunCount() {
        return this.activeSuns.length;
    }

    /**
     * Clean up all sun objects
     */
    destroy() {
        this.stop();
        
        this.activeSuns.forEach(sun => {
            if (sun && sun.active) {
                sun.destroy();
            }
        });
        
        this.activeSuns = [];
    }
}
