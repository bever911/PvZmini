/**
 * ZombieManager - Manages zombie spawning and waves
 * 
 * Features:
 * - Wave-based spawning (10 waves total)
 * - Progressive difficulty
 * - Victory condition after wave 10
 * - Random lane selection
 * - Mix of zombie types
 */
class ZombieManager {
    constructor(scene) {
        this.scene = scene;
        this.spawnX = 1350; // Off right edge
        
        // Wave system
        this.currentWave = 0;
        this.maxWaves = 10;
        this.zombiesPerWave = 5; // Base zombies per wave
        this.waveActive = false;
        this.zombiesLeftInWave = 0;
        
        // Spawn timing (slower as requested)
        this.initialDelay = 15000; // 15 seconds before first wave
        this.zombieSpawnDelay = 5000; // 5 seconds between zombies (was 3)
        this.waveCooldown = 10000; // 10 seconds between waves
        
        // Available zombie types with weights (probability)
        this.zombieTypes = [
            { class: BasicZombie, weight: 50 },    // 50% chance
            { class: ConeZombie, weight: 30 },     // 30% chance
            { class: BucketZombie, weight: 20 }    // 20% chance
        };
        
        console.log('ZombieManager initialized - 10 waves to victory!');
    }

    /**
     * Start the wave system
     */
    startWaves() {
        console.log('🌊 Wave system starting! Survive 10 waves to win!');
        
        // Wait initial delay, then start first wave
        this.scene.time.delayedCall(this.initialDelay, () => {
            this.startNextWave();
        });
    }

    /**
     * Start the next wave
     */
    startNextWave() {
        if (this.scene.isGameOver) return;
        
        this.currentWave++;
        
        // Check for victory
        if (this.currentWave > this.maxWaves) {
            console.log('🎉 ALL WAVES COMPLETE! VICTORY! 🎉');
            this.scene.victory();
            return;
        }
        
        this.waveActive = true;
        
        // Calculate zombies for this wave (progressive difficulty)
        // Wave 1: 5 zombies, Wave 10: 14 zombies
        this.zombiesLeftInWave = this.zombiesPerWave + Math.floor(this.currentWave * 0.9);
        
        console.log(`🌊 WAVE ${this.currentWave}/${this.maxWaves} - ${this.zombiesLeftInWave} zombies incoming!`);
        
        // Update UI
        this.scene.updateWaveDisplay(this.currentWave, this.maxWaves);
        
        // Spawn zombies with delays
        for (let i = 0; i < this.zombiesLeftInWave; i++) {
            this.scene.time.delayedCall(i * this.zombieSpawnDelay, () => {
                if (!this.scene.isGameOver) {
                    this.spawnRandomZombie();
                    
                    // Check if wave is complete
                    if (i === this.zombiesLeftInWave - 1) {
                        this.onWaveSpawningComplete();
                    }
                }
            });
        }
    }

    /**
     * Called when all zombies in wave have spawned
     */
    onWaveSpawningComplete() {
        console.log(`Wave ${this.currentWave} - All zombies spawned. Waiting for wave to clear...`);
        
        // Check every second if all zombies are dead
        const checkTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.scene.isGameOver) {
                    checkTimer.remove();
                    return;
                }
                
                // Count active zombies
                const activeZombies = this.getZombieCount();
                
                if (activeZombies === 0) {
                    checkTimer.remove();
                    this.onWaveComplete();
                }
            },
            loop: true
        });
    }

    /**
     * Called when wave is cleared
     */
    onWaveComplete() {
        this.waveActive = false;
        console.log(`✅ Wave ${this.currentWave} complete!`);
        
        // Start next wave after cooldown
        if (this.currentWave < this.maxWaves) {
            console.log(`Next wave in ${this.waveCooldown / 1000} seconds...`);
            this.scene.time.delayedCall(this.waveCooldown, () => {
                this.startNextWave();
            });
        } else {
            // Victory!
            console.log('🎉 ALL WAVES CLEARED! VICTORY! 🎉');
            this.scene.victory();
        }
    }

    /**
     * Spawn a random zombie in a random lane
     */
    spawnRandomZombie() {
        // Pick random lane (0-4)
        const row = Phaser.Math.Between(0, 4);
        
        // Pick random zombie type based on weights
        // Later waves have more tough zombies
        const zombieType = this.pickWeightedZombieType();
        
        // Calculate Y position for this row
        const gridY = 150 + (row * 100) + 50; // Grid offset + row height + center
        
        // Spawn the zombie
        const zombie = new zombieType(this.scene, this.spawnX, gridY, row);
        
        console.log(`Spawned ${zombie.zombieType} in row ${row} (Wave ${this.currentWave})`);
    }

    /**
     * Pick a zombie type based on weighted probabilities
     * Later waves have higher chance of tough zombies
     */
    pickWeightedZombieType() {
        // Adjust weights based on wave number
        let types = [...this.zombieTypes];
        
        // Waves 1-3: Mostly basic zombies
        // Waves 4-7: Mix
        // Waves 8-10: More tough zombies
        if (this.currentWave >= 6) {
            types = [
                { class: BasicZombie, weight: 30 },
                { class: ConeZombie, weight: 40 },
                { class: BucketZombie, weight: 30 }
            ];
        } else if (this.currentWave >= 3) {
            types = [
                { class: BasicZombie, weight: 40 },
                { class: ConeZombie, weight: 35 },
                { class: BucketZombie, weight: 25 }
            ];
        }
        
        const totalWeight = types.reduce((sum, type) => sum + type.weight, 0);
        let random = Phaser.Math.Between(1, totalWeight);
        
        for (const zombieType of types) {
            random -= zombieType.weight;
            if (random <= 0) {
                return zombieType.class;
            }
        }
        
        // Fallback to basic zombie
        return BasicZombie;
    }

    /**
     * Spawn a specific zombie type in a specific lane
     */
    spawnZombie(zombieClass, row) {
        const gridY = 150 + (row * 100) + 50;
        const zombie = new zombieClass(this.scene, this.spawnX, gridY, row);
        return zombie;
    }

    /**
     * Get count of active zombies
     */
    getZombieCount() {
        return this.scene.zombies ? this.scene.zombies.filter(z => z && z.active && !z.isDead).length : 0;
    }

    /**
     * Clean up all zombies
     */
    destroyAllZombies() {
        if (this.scene.zombies) {
            this.scene.zombies.forEach(zombie => {
                if (zombie && zombie.active) {
                    zombie.destroy();
                }
            });
            this.scene.zombies = [];
        }
    }
}
