/**
 * BucketZombie - Zombie with metal bucket armor
 * 
 * Health: 150 (reduced for better balance)
 * Speed: 20 pixels/second
 * Damage: 20 per bite
 */
class BucketZombie extends Zombie {
    constructor(scene, x, y, row) {
        super(scene, x, y, row, {
            health: 150,
            speed: 20,
            damage: 20,
            type: 'Bucket Zombie',
            emoji: '🧟',
            color: 0xd0d0d0
        });
        
        // Add metal bucket on top (silver rectangle instead of emoji)
        this.bucket = this.scene.add.rectangle(0, -28, 35, 30, 0xc0c0c0);
        this.bucket.setStrokeStyle(2, 0x808080);
        this.add(this.bucket);
        
        // Add bucket handle (darker grey arc effect)
        const handle = this.scene.add.ellipse(0, -25, 30, 8, 0x808080);
        this.add(handle);
    }
}
