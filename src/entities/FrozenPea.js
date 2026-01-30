/**
 * FrozenPea - Frozen projectile that slows zombies
 */
class FrozenPea extends Pea {
    constructor(scene, x, y, row, damage) {
        super(scene, x, y, row, damage);
        
        this.slowDuration = 5000;
        this.slowAmount = 0.5;
        
        // Tint the circle blue for frozen effect
        if (this.circle) {
            this.circle.setTint(0x00ffff);
        }
    }

    hitZombie(zombie) {
        if (zombie && !zombie.isDead) {
            zombie.takeDamage(this.damage);
            
            if (!zombie.isFrozen) {
                zombie.isFrozen = true;
                zombie.originalSpeed = zombie.speed;
                zombie.speed = zombie.speed * this.slowAmount;
                
                if (zombie.visual) {
                    zombie.visual.setTint(0x88ccff);
                }
                
                console.log('Zombie frozen! Speed reduced to', zombie.speed);
                
                this.scene.time.delayedCall(this.slowDuration, () => {
                    if (zombie && !zombie.isDead) {
                        zombie.isFrozen = false;
                        zombie.speed = zombie.originalSpeed;
                        if (zombie.visual) {
                            zombie.visual.clearTint();
                        }
                        console.log('Zombie thawed! Speed restored to', zombie.speed);
                    }
                });
            }
        }
        
        this.destroy();
    }
}
