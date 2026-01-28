/**
 * ZombieManager - Manages zombie spawning and waves
 * 
 * Features:
 * - Spawns zombies from right edge
 * - Random lane selection
 * - Wave-based spawning
 * - Mix of zombie types
 */
class ZombieManager {
    constructor(scene) {
        this.scene = scene;
        this.spawnX = 1350; // Off right edge
        
        // Available zombie types with weights (probability)
        this.zombieTypes = [
            { class: BasicZombie, weight: 50 },    // 50% chance
            { class: ConeZombie, weight: 30 },     // 30% chance
            { class: BucketZombie, weight: 20 }    // 20% chance
        ];
        
        console.log('ZombieManager initialized');
    }

    /**
     * Start the test wave (spawn 5 zombies with delays)
     */
    startTestWave() {
        console.log('Starting test wave: 5 zombies incoming!');
        
        // Wait 10 seconds before first zombie
        this.scene.time.delayedCall(10000, () => {
            console.log('First zombie spawning in 3...');
            this.spawnRandomZombie();
            
            // Spawn 4 more zombies with 3 second delays
            for (let i = 1; i < 5; i++) {
                this.scene.time.delayedCall(10000 + (i * 3000), () => {
                    console.log(`Zombie ${i + 1} spawning...`);
                    this.spawnRandomZombie();
                });
            }
        });
    }

    /**
     * Spawn a random zombie in a random lane
     */
    spawnRandomZombie() {
        // Pick random lane (0-4)
        const row = Phaser.Math.Between(0, 4);
        
        // Pick random zombie type based on weights
        const zombieType = this.pickWeightedZombieType();
        
        // Calculate Y position for this row
        const gridY = 150 + (row * 100) + 50; // Grid offset + row height + center
        
        // Spawn the zombie
        const zombie = new zombieType(this.scene, this.spawnX, gridY, row);
        
        console.log(`Spawned ${zombie.zombieType} in row ${row}`);
    }

    /**
     * Pick a zombie type based on weighted probabilities
     */
    pickWeightedZombieType() {
        const totalWeight = this.zombieTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Phaser.Math.Between(1, totalWeight);
        
        for (const zombieType of this.zombieTypes) {
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
        return this.scene.zombies ? this.scene.zombies.length : 0;
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
