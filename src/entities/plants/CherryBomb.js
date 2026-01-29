/**
 * Cherry Bomb - Explodes and damages nearby zombies
 * 
 * Cost: 150 sun
 * Health: 100
 * Ability: Explodes after 1 second, damages all zombies in 3x3 area
 */
class CherryBomb extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 100,
            type: 'Cherry Bomb',
            emoji: '💣',
            color: 0xff0000
        });
        
        // Cherry Bomb properties
        this.explosionDelay = 1000; // 1 second
        this.explosionDamage = 1800; // Massive damage (instant kill)
        this.explosionRange = 1; // 3x3 grid (1 cell in each direction)
        
        // Start countdown to explosion
        this.startCountdown();
    }

    /**
     * Start explosion countdown
     */
    startCountdown() {
        // Pulsing animation while counting down
        this.scene.tweens.add({
            targets: this.visual,
            scale: { from: 1, to: 1.3 },
            duration: 200,
            yoyo: true,
            repeat: 4, // Pulse 5 times in 1 second
            ease: 'Sine.easeInOut'
        });
        
        // Explode after 1 second
        this.scene.time.delayedCall(this.explosionDelay, () => {
            this.explode();
        });
        
        console.log('Cherry Bomb armed! Exploding in 1 second...');
    }

    /**
     * BOOM!
     */
    explode() {
        if (this.isDead) return;
        
        console.log('BOOM! Cherry Bomb exploded at [' + this.row + ', ' + this.col + ']');
        
        // Create explosion visual
        const explosion = this.scene.add.circle(this.x, this.y, 150, 0xff6600, 0.8);
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 1, to: 0 },
            duration: 500,
            onComplete: () => explosion.destroy()
        });
        
        // Flash effect
        this.scene.cameras.main.flash(200, 255, 100, 0);
        
        // Damage all zombies in range (3x3 grid area)
        if (this.scene.zombies) {
            this.scene.zombies.forEach(zombie => {
                if (!zombie || !zombie.active) return;
                
                // Check if zombie is within explosion range
                const rowDiff = Math.abs(zombie.row - this.row);
                const colDiff = Math.abs(zombie.col - this.col);
                
                if (rowDiff <= this.explosionRange && colDiff <= this.explosionRange) {
                    console.log('💥 Cherry Bomb hit', zombie.zombieType, 'in explosion!');
                    zombie.takeDamage(this.explosionDamage);
                }
            });
        }
        
        // Destroy self
        this.isDead = true;
        this.scene.gridSystem.setCellOccupied(this.row, this.col, false);
        this.destroy();
    }

    /**
     * Cherry Bomb can't take damage - it explodes first!
     */
    takeDamage(amount) {
        // Cherry Bomb ignores damage and just explodes
        if (!this.isDead) {
            console.log('Cherry Bomb was hit! Triggering early explosion!');
            this.explode();
        }
    }
}

// Static properties for UI
CherryBomb.cost = 150;
CherryBomb.displayName = 'Cherry Bomb';
CherryBomb.description = 'Explodes in area';
