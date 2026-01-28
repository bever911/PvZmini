/**
 * ConeZombie - Zombie with traffic cone armor
 * 
 * Health: 200 (2x basic)
 * Speed: 20 pixels/second
 * Damage: 20 per bite
 */
class ConeZombie extends Zombie {
    constructor(scene, x, y, row) {
        super(scene, x, y, row, {
            health: 200,
            speed: 20,
            damage: 20,
            type: 'Cone Zombie',
            emoji: '🧟‍♂️',
            color: 0xa0a0a0
        });
        
        // Add cone on top
        this.cone = this.scene.add.text(0, -35, '🚧', {
            fontSize: '25px'
        }).setOrigin(0.5);
        this.add(this.cone);
    }
}
