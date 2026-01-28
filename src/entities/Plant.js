/**
 * Plant - Base class for all plant types
 * 
 * Features:
 * - Health system
 * - Grid positioning
 * - Visual representation
 * - Damage handling
 */
class Plant extends Phaser.GameObjects.Container {
    constructor(scene, x, y, row, col, config) {
        super(scene, x, y);
        
        this.scene = scene;
        this.row = row;
        this.col = col;
        
        // Plant stats (can be overridden by subclasses)
        this.maxHealth = config.health || 100;
        this.health = this.maxHealth;
        this.plantType = config.type || 'unknown';
        this.emoji = config.emoji || '🌱';
        this.color = config.color || 0x00ff00;
        
        // State
        this.isDead = false;
        
        // Add to scene
        scene.add.existing(this);
        
        // Create visual
        this.createVisual();
        
        console.log(`${this.plantType} planted at [${row}, ${col}]`);
    }

    /**
     * Create the visual representation
     */
    createVisual() {
        // Background circle
        this.bg = this.scene.add.circle(0, 0, 40, this.color);
        this.add(this.bg);
        
        // Plant emoji
        this.visual = this.scene.add.text(0, 0, this.emoji, {
            fontSize: '60px'
        }).setOrigin(0.5);
        this.add(this.visual);
        
        // Health bar (if not full health)
        this.createHealthBar();
    }

    /**
     * Create health bar above plant
     */
    createHealthBar() {
        const barWidth = 70;
        const barHeight = 8;
        const barY = -50;
        
        // Background (red)
        this.healthBg = this.scene.add.rectangle(0, barY, barWidth, barHeight, 0xff0000);
        this.add(this.healthBg);
        
        // Foreground (green, shows current health)
        this.healthBar = this.scene.add.rectangle(0, barY, barWidth, barHeight, 0x00ff00);
        this.add(this.healthBar);
        
        // Initially hidden (only show when damaged)
        this.healthBg.setVisible(false);
        this.healthBar.setVisible(false);
    }

    /**
     * Update health bar display
     */
    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 70;
        
        // Update bar width
        this.healthBar.width = barWidth * healthPercent;
        
        // Show health bar if damaged
        if (this.health < this.maxHealth) {
            this.healthBg.setVisible(true);
            this.healthBar.setVisible(true);
        }
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
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
        
        if (this.health <= 0) {
            this.die();
        }
        
        console.log(`${this.plantType} took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
    }

    /**
     * Plant dies
     */
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.5,
            angle: 180,
            duration: 500,
            onComplete: () => {
                // Free up the grid cell
                this.scene.gridSystem.setCellOccupied(this.row, this.col, false);
                this.destroy();
            }
        });
        
        console.log(`${this.plantType} died at [${this.row}, ${this.col}]`);
    }

    /**
     * Update method (called every frame)
     * Override in subclasses for custom behavior
     */
    update() {
        // Override in subclasses
    }

    /**
     * Clean up
     */
    destroy(fromScene) {
        super.destroy(fromScene);
    }
}
