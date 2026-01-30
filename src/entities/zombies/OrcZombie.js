/**
 * OrcZombie - Tough orc warrior
 * 
 * Health: 300 (same as original bucket zombie)
 * Speed: 20 pixels/second
 * Damage: 20 per bite
 * Unlock: Wave 7
 */
class OrcZombie extends Zombie {
    constructor(scene, x, y, row) {
        super(scene, x, y, row, {
            health: 300,
            speed: 20,
            damage: 20,
            type: 'Orc',
            emoji: '👹',
            color: 0x228B22
        });
        
        // Add horns/tusks
        this.horns = this.scene.add.text(0, -35, '⚔️', {
            fontSize: '20px'
        }).setOrigin(0.5);
        this.add(this.horns);
    }
}
