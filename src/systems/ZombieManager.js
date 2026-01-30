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
        this.spawnX = 1350;
        
        this.currentWave = 0;
        this.maxWaves = 10;
        this.zombiesPerWave = 5;
        this.waveActive = false;
        this.zombiesLeftInWave = 0;
        
        this.initialDelay = 15000;
        this.zombieSpawnDelay = 5000;
        this.waveCooldown = 10000;
        
        this.zombieTypes = [
            { class: BasicZombie, weight: 50 },
            { class: ConeZombie, weight: 30 },
            { class: BucketZombie, weight: 20 }
        ];
        
        console.log('ZombieManager initialized - 10 waves to victory!');
    }

    startWaves() {
        console.log('Wave system starting! Survive 10 waves to win!');
        
        this.scene.time.delayedCall(this.initialDelay, () => {
            this.startNextWave();
        });
    }

    startNextWave() {
        if (this.scene.isGameOver) return;
        
        this.currentWave++;
        
        if (this.currentWave > this.maxWaves) {
            console.log('ALL WAVES COMPLETE! VICTORY!');
            this.scene.victory();
            return;
        }
        
        this.waveActive = true;
        
        this.zombiesLeftInWave = this.zombiesPerWave + Math.floor(this.currentWave * 0.9);
        
        console.log('WAVE ' + this.currentWave + '/' + this.maxWaves + ' - ' + this.zombiesLeftInWave + ' zombies incoming!');
        
        this.scene.updateWaveDisplay(this.currentWave, this.maxWaves);
        
        // Unlock new plants for this wave
        if (this.scene.plantSelector) {
            this.scene.plantSelector.unlockPlantsForWave(this.currentWave);
        }
        
        for (let i = 0; i < this.zombiesLeftInWave; i++) {
            this.scene.time.delayedCall(i * this.zombieSpawnDelay, () => {
                if (!this.scene.isGameOver) {
                    this.spawnRandomZombie();
                    
                    if (i === this.zombiesLeftInWave - 1) {
                        this.onWaveSpawningComplete();
                    }
                }
            });
        }
    }

    onWaveSpawningComplete() {
        console.log('Wave ' + this.currentWave + ' - All zombies spawned. Waiting for wave to clear...');
        
        const checkTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.scene.isGameOver) {
                    checkTimer.remove();
                    return;
                }
                
                const activeZombies = this.getZombieCount();
                
                if (activeZombies === 0) {
                    checkTimer.remove();
                    this.onWaveComplete();
                }
            },
            loop: true
        });
    }

    onWaveComplete() {
        this.waveActive = false;
        console.log('Wave ' + this.currentWave + ' complete!');
        
        if (this.currentWave < this.maxWaves) {
            console.log('Next wave in ' + (this.waveCooldown / 1000) + ' seconds...');
            this.scene.time.delayedCall(this.waveCooldown, () => {
                this.startNextWave();
            });
        } else {
            console.log('ALL WAVES CLEARED! VICTORY!');
            this.scene.victory();
        }
    }

    spawnRandomZombie() {
        const row = Phaser.Math.Between(0, 4);
        const zombieType = this.pickWeightedZombieType();
        const gridY = 150 + (row * 100) + 50;
        const zombie = new zombieType(this.scene, this.spawnX, gridY, row);
        
        console.log('Spawned ' + zombie.zombieType + ' in row ' + row + ' (Wave ' + this.currentWave + ')');
    }

    pickWeightedZombieType() {
        let types = this.zombieTypes.slice();
        
        // Add Orcs starting at wave 7
        if (this.currentWave >= 7) {
            types = [
                { class: BasicZombie, weight: 25 },
                { class: ConeZombie, weight: 30 },
                { class: BucketZombie, weight: 25 },
                { class: OrcZombie, weight: 20 }
            ];
        } else if (this.currentWave >= 6) {
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
        
        return BasicZombie;
    }

    spawnZombie(zombieClass, row) {
        const gridY = 150 + (row * 100) + 50;
        const zombie = new zombieClass(this.scene, this.spawnX, gridY, row);
        return zombie;
    }

    getZombieCount() {
        return this.scene.zombies ? this.scene.zombies.filter(z => z && z.active && !z.isDead).length : 0;
    }

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
