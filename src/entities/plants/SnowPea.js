/**
 * Snow Pea - Shoots frozen peas that slow zombies
 * 
 * Cost: 175 sun
 * Health: 100
 * Ability: Slows zombies by 50% for 5 seconds
 * Unlock: Wave 5
 */
class SnowPea extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 100,
            type: 'Snow Pea',
            emoji: '❄️',
            color: 0x00ccff
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
        
        console.log('Snow Pea ready to freeze zombies!');
    }

    shoot() {
        if (this.isDead) return;
        
        const hasZombiesInRow = this.scene.zombies.some(z => z.row === this.row && !z.isDead);
        
        if (hasZombiesInRow) {
            const pea = new FrozenPea(this.scene, this.x + 40, this.y, this.row, this.damage);
            console.log('Snow Pea fired frozen pea!');
        }
    }

    destroy(fromScene) {
        if (this.shootTimer) {
            this.shootTimer.remove();
        }
        super.destroy(fromScene);
    }
}

SnowPea.cost = 175;
SnowPea.displayName = 'Snow Pea';
SnowPea.description = 'Slows zombies';
SnowPea.unlockWave = 5;
