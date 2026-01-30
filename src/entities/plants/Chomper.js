/**
 * Chomper - Eats zombies whole but needs time to digest
 * 
 * Cost: 150 sun
 * Health: 100
 * Ability: Instant kill one zombie, then 10 second digest time
 * Unlock: Wave 7
 */
class Chomper extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 100,
            type: 'Chomper',
            emoji: '🌺',
            color: 0xff0088
        });
        
        this.isDigesting = false;
        this.digestTime = 10000;
        this.attackRange = 80;
        
        console.log('Chomper ready to chomp!');
    }

    update(delta) {
        if (this.isDead || this.isDigesting) return;
        
        this.checkForZombiesToEat();
    }

    checkForZombiesToEat() {
        if (!this.scene.zombies) return;
        
        for (const zombie of this.scene.zombies) {
            if (zombie.row === this.row && !zombie.isDead) {
                const distance = Math.abs(this.x - zombie.x);
                if (distance < this.attackRange) {
                    this.eatZombie(zombie);
                    return;
                }
            }
        }
    }

    eatZombie(zombie) {
        console.log('CHOMP! Chomper eating zombie!');
        
        zombie.die();
        
        this.isDigesting = true;
        
        this.visual.setText('😋');
        
        this.scene.tweens.add({
            targets: this.visual,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            yoyo: true,
            repeat: 0
        });
        
        this.scene.time.delayedCall(this.digestTime, () => {
            if (!this.isDead) {
                this.isDigesting = false;
                this.visual.setText('🌺');
                console.log('Chomper finished digesting!');
            }
        });
    }
}

Chomper.cost = 150;
Chomper.displayName = 'Chomper';
Chomper.description = 'Eats zombies';
Chomper.unlockWave = 7;
