/**
 * Zombie - Base class for all zombie types
 * 
 * Features:
 * - Walks toward the house
 * - Stops and eats plants
 * - Takes damage from projectiles
 * - Health system
 */
class Zombie extends Phaser.GameObjects.Container {
    constructor(scene, x, y, row, config) {
        super(scene, x, y);
        
        this.scene = scene;
        this.row = row;
        
        // Zombie stats (can be overridden by subclasses)
        this.maxHealth = config.health || 100;
        this.health = this.maxHealth;
        this.speed = config.speed || 20; // pixels per second
        this.damage = config.damage || 20;
        this.zombieType = config.type || 'Basic';
        this.emoji = config.emoji || '🧟';
        this.color = config.color || 0x808080;
        
        // State
        this.isDead = false;
        this.isEating = false;
        this.targetPlant = null;
        this.eatTimer = null;
        
        // Add to scene
        scene.add.existing(this);
        
        // Create visual
        this.createVisual();
        
        // Store in scene's zombies array
        if (!scene.zombies) {
            scene.zombies = [];
        }
        scene.zombies.push(this);
        
        console.log(`${this.zombieType} spawned in row ${row}`);
    }

    /**
     * Create the visual representation
     */
    createVisual() {
        // Background circle
        this.bg = this.scene.add.circle(0, 0, 35, this.color);
        this.add(this.bg);
        
        // Zombie emoji
        this.visual = this.scene.add.text(0, 0, this.emoji, {
            fontSize: '50px'
        }).setOrigin(0.5);
        this.add(this.visual);
        
        // Health bar
        this.createHealthBar();
        
        // Walking animation (bob up and down)
        this.scene.tweens.add({
            targets: this.visual,
            y: -3,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create health bar above zombie
     */
    createHealthBar() {
        const barWidth = 60;
        const barHeight = 6;
        const barY = -45;
        
        // Background (red)
        this.healthBg = this.scene.add.rectangle(0, barY, barWidth, barHeight, 0xff0000);
        this.add(this.healthBg);
        
        // Foreground (green, shows current health)
        this.healthBar = this.scene.add.rectangle(0, barY, barWidth, barHeight, 0x00ff00);
        this.add(this.healthBar);
    }

    /**
     * Update health bar display
     */
    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 60;
        this.healthBar.width = barWidth * healthPercent;
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        this.updateHealthBar();
        
        // Flash red when hit
        this.scene.tweens.add({
            targets: this.bg,
            alpha: 0.3,
            duration: 100,
            yoyo: true
        });
        
        if (this.health <= 0) {
            this.die();
        }
        
        console.log(`${this.zombieType} took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
    }

    /**
     * Zombie dies
     */
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // Stop eating
        if (this.eatTimer) {
            this.eatTimer.remove();
        }
        
        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y + 20,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
        
        console.log(`${this.zombieType} died in row ${this.row}`);
    }

    /**
     * Start eating a plant
     */
    startEating(plant) {
        if (this.isDead || this.isEating) return;
        
        console.log(`🧟 ${this.zombieType} found plant at [${plant.row}, ${plant.col}] - starting to eat!`);
        
        this.isEating = true;
        this.targetPlant = plant;
        
        // Stop walking
        this.speed = 0;
        
        // Bite every 1 second
        this.eatTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.bite,
            callbackScope: this,
            loop: true
        });
        
        // Eating animation (lean forward)
        this.scene.tweens.add({
            targets: this.visual,
            x: -10,
            duration: 200,
            yoyo: true,
            repeat: -1
        });
        
        console.log(`${this.zombieType} started eating plant at [${plant.row}, ${plant.col}]`);
    }

    /**
     * Stop eating
     */
    stopEating() {
        if (!this.isEating) return;
        
        this.isEating = false;
        this.targetPlant = null;
        
        // Resume walking
        this.speed = 20; // Reset to normal speed
        
        // Stop eating timer
        if (this.eatTimer) {
            this.eatTimer.remove();
            this.eatTimer = null;
        }
        
        // Stop eating animation
        this.scene.tweens.killTweensOf(this.visual);
        this.visual.x = 0;
        
        // Restart walking animation
        this.scene.tweens.add({
            targets: this.visual,
            y: -3,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log(`${this.zombieType} stopped eating`);
    }

    /**
     * Bite the plant
     */
    bite() {
        if (!this.targetPlant || this.targetPlant.isDead) {
            this.stopEating();
            return;
        }
        
        // Damage the plant
        this.targetPlant.takeDamage(this.damage);
        
        console.log(`${this.zombieType} bit plant for ${this.damage} damage`);
    }

    /**
     * Check if zombie reached the house
     */
    reachedHouse() {
        return this.x < 150; // Left edge of lawn
    }

    /**
     * Update method (called every frame)
     */
    update(delta) {
        if (this.isDead) return;
        
        // Check if eating, verify plant still exists
        if (this.isEating) {
            if (!this.targetPlant || this.targetPlant.isDead) {
                this.stopEating();
            }
            return; // Don't move while eating
        }
        
        // Check if reached house
        if (this.x < 150) {
            console.log('🚨 ZOMBIE REACHED THE HOUSE! GAME OVER! 🚨');
            this.scene.gameOver();
            return;
        }
        
        // Move left toward house
        this.x -= (this.speed * delta) / 1000;
        
        // Check for plants to eat
        this.checkForPlants();
    }

    /**
     * Check if there's a plant in front of zombie
     */
    checkForPlants() {
        if (!this.scene.plants) return;
        
        // Check plants in same row
        for (const plant of this.scene.plants) {
            if (plant.row === this.row && !plant.isDead) {
                // Check if zombie is close to plant
                const distance = Math.abs(this.x - plant.x);
                if (distance < 60) {
                    this.startEating(plant);
                    return;
                }
            }
        }
    }

    /**
     * Clean up
     */
    destroy(fromScene) {
        if (this.eatTimer) {
            this.eatTimer.remove();
        }
        
        // Remove from zombies array
        if (this.scene.zombies) {
            const index = this.scene.zombies.indexOf(this);
            if (index > -1) {
                this.scene.zombies.splice(index, 1);
            }
        }
        
        super.destroy(fromScene);
    }
}
