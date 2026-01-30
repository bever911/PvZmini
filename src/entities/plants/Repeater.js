/**
 * Repeater - Shoots two peas at once
 * 
 * Cost: 200 sun
 * Health: 100
 * Ability: Fires 2 peas per shot
 * Unlock: Wave 3
 */
class Repeater extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 100,
            type: 'Repeater',
            emoji: '🌿',
            color: 0x00aa00
        });
        
        this.fireRate = 1500;
        this.damage = 20;
        
        this.startShooting();
    }

    startShooting() {
        this.shootTimer = this.scene.time.addEvent({
            delay: this.fireRate,
            callback: this.shoot,
            callbackScope: this,
            loop: true
        });
        
        console.log('Repeater ready to shoot 2 peas at once!');
    }

    shoot() {
        if (this.isDead) return;
        
        const hasZombiesInRow = this.scene.zombies.some(z => z.row === this.row && !z.isDead);
        
        if (hasZombiesInRow) {
            const pea1 = new Pea(this.scene, this.x + 40, this.y, this.row, this.damage);
            
            this.scene.time.delayedCall(150, () => {
                if (!this.isDead) {
                    const pea2 = new Pea(this.scene, this.x + 40, this.y, this.row, this.damage);
                }
            });
            
            console.log('Repeater fired 2 peas!');
        }
    }

    destroy(fromScene) {
        if (this.shootTimer) {
            this.shootTimer.remove();
        }
        super.destroy(fromScene);
    }
}

Repeater.cost = 200;
Repeater.displayName = 'Repeater';
Repeater.description = 'Shoots 2 peas';
Repeater.unlockWave = 3;
