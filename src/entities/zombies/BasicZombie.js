/**
 * BasicZombie - Standard zombie
 * 
 * Health: 100
 * Speed: 20 pixels/second
 * Damage: 20 per bite
 */
class BasicZombie extends Zombie {
    constructor(scene, x, y, row) {
        super(scene, x, y, row, {
            health: 100,
            speed: 20,
            damage: 20,
            type: 'Basic Zombie',
            emoji: '🧟',
            color: 0x808080
        });
    }
}
