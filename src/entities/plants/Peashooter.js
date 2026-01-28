/**
 * Peashooter - Shoots peas at zombies
 * 
 * Cost: 100 sun
 * Health: 100
 * Ability: Shoots peas every 1.5 seconds
 */
class Peashooter extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 100,
            type: 'Peashooter',
            emoji: '🌱',
            color: 0x00ff00
        });
        
        // Peashooter-specific properties
        this.shootInterval = 1500; // 1.5 seconds
        this.damage = 20;
        
        // Start shooting
        this.startShooting();
    }

    /**
     * Start the shooting cycle
     */
    startShooting() {
        // Shoot every 1.5 seconds
        this.shootTimer = this.scene.time.addEvent({
            delay: this.shootInterval,
            callback: this.shoot,
            callbackScope: this,
            loop: true
        });
        
        console.log('Peashooter ready to shoot');
    }

    /**
     * Shoot a pea
     */
    shoot() {
        if (this.isDead) return;
        
        // TODO: Check if there are zombies in this row
        // For now, just shoot anyway
        
        // Create pea projectile
        const pea = new Pea(this.scene, this.x + 40, this.y, this.row, this.damage);
        
        // Shooting animation
        this.scene.tweens.add({
            targets: this.visual,
            x: 10,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
        
        console.log('Peashooter shot a pea!');
    }

    /**
     * Clean up timers when destroyed
     */
    destroy(fromScene) {
        if (this.shootTimer) {
            this.shootTimer.remove();
        }
        super.destroy(fromScene);
    }
}

// Static properties for UI
Peashooter.cost = 100;
Peashooter.displayName = 'Peashooter';
Peashooter.description = 'Shoots peas';
