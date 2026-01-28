/**
 * BucketZombie - Zombie with bucket armor
 * 
 * Health: 300 (3x basic)
 * Speed: 20 pixels/second
 * Damage: 20 per bite
 */
class BucketZombie extends Zombie {
    constructor(scene, x, y, row) {
        super(scene, x, y, row, {
            health: 300,
            speed: 20,
            damage: 20,
            type: 'Bucket Zombie',
            emoji: '🧟',
            color: 0xc0c0c0
        });
        
        // Add bucket on top
        this.bucket = this.scene.add.text(0, -35, '🪣', {
            fontSize: '30px'
        }).setOrigin(0.5);
        this.add(this.bucket);
    }
}
