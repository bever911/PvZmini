/**
 * Pea - Projectile shot by Peashooter
 * 
 * Features:
 * - Flies across the screen
 * - Damages zombies on contact
 * - Disappears at edge of screen
 */
class Pea extends Phaser.GameObjects.Container {
    constructor(scene, x, y, row, damage) {
        super(scene, x, y);
        
        this.scene = scene;
        this.row = row;
        this.damage = damage;
        this.speed = 400; // pixels per second
        
        // Create visual
        this.createVisual();
        
        // Add to scene
        scene.add.existing(this);
        
        // Store in scene's projectiles array
        if (!scene.projectiles) {
            scene.projectiles = [];
        }
        scene.projectiles.push(this);
    }

    /**
     * Create pea visual
     */
    createVisual() {
        // Green circle for pea
        this.circle = this.scene.add.circle(0, 0, 8, 0x00ff00);
        this.add(this.circle);
        
        // Shine effect
        const shine = this.scene.add.circle(-2, -2, 3, 0xffffff, 0.6);
        this.add(shine);
    }

    /**
     * Update pea position
     */
    update(delta) {
        // Move right
        this.x += (this.speed * delta) / 1000;
        
        // Check if off screen
        if (this.x > 1300) {
            this.destroy();
        }
        
        // TODO: Check collision with zombies
    }

    /**
     * Hit a zombie
     */
    hitZombie(zombie) {
        // Damage the zombie
        if (zombie && zombie.takeDamage) {
            zombie.takeDamage(this.damage);
        }
        
        // Destroy this pea
        this.destroy();
    }

    /**
     * Clean up
     */
    destroy(fromScene) {
        // Remove from projectiles array
        if (this.scene.projectiles) {
            const index = this.scene.projectiles.indexOf(this);
            if (index > -1) {
                this.scene.projectiles.splice(index, 1);
            }
        }
        
        super.destroy(fromScene);
    }
}
