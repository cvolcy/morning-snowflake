import { Alien, Block, PlayerShip, type Bullet } from "./models";

export default class GameState {
    public forcedPause:boolean = false;
    private readonly blockMergeThreshold = 30;

    private lastAlienSpawn: number = 0;
    private alienSpawnDelay: number = 2000;
    private bulletSpeed = 7;

    constructor(public ctx: CanvasRenderingContext2D, public canvas: HTMLCanvasElement, public status: 'started' | 'gameOver' | 'paused', public score: number, public playerShip: PlayerShip, public bullets: Bullet[], public fallingsBlocks: Block[], public aliens: Alien[]) {}

    draw() {
        this.playerShip.draw();
        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw());
        // Draw aliens
        this.aliens.forEach(alien => alien.draw());
        // Draw falling blocks
        this.fallingsBlocks.forEach(block => block.draw());
        // Draw score, health, and ammo
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = "left";
        this.ctx.font = '13px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Health: ${this.playerShip.health}`, this.canvas.width - 300, 30);
        this.ctx.fillText(`Ammo: ${this.playerShip.ammo}`, this.canvas.width - 150, 30);
        // this.ctx.fillText(`x: ${this.playerShip.x}`, this.canvas.width - 150, 60);
    }

    update(currentTime: number) {
        if (currentTime - this.lastAlienSpawn > this.getAlienSpawnDelay()) {
            this.lastAlienSpawn = currentTime;
            this.spawnAlien();
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => bullet.y > 0);
        this.bullets.forEach(bullet => bullet.y -= this.bulletSpeed);

        // Update aliens
        this.aliens.forEach(alien => {
            alien.y += 1;
            this.bullets.forEach((bullet, bIndex) => {
                if (bullet.x > alien.x && bullet.x < alien.x + Alien.ALIEN_WIDTH &&
                    bullet.y > alien.y && bullet.y < alien.y + Alien.ALIEN_HEIGHT) {
    
                    if (bullet.type === 'super') {
                        alien.life = 0;
                    }
                    alien.life--;
                    this.bullets.splice(bIndex, 1);
                    if (alien.life <= 0) {
                        this.aliens.splice(this.aliens.indexOf(alien), 1);
                        this.score += 10;
                    }
                }
            });
    
            if (alien.y > this.canvas.height) {
                this.playerShip.health = Math.max(0, this.playerShip.health - alien.life);
                this.aliens.splice(this.aliens.indexOf(alien), 1);
            }
        });

        

    this.fallingsBlocks = this.fallingsBlocks.sort((a, b) => a.y - b.y)
    // Update falling blocks
    for (let i = 0; i < this.fallingsBlocks.length; i++) {
        const block = this.fallingsBlocks[i];
        for (let j = i + 1; j < this.fallingsBlocks.length; j++) {
            const otherBlock = this.fallingsBlocks[j];
            if (block.x < otherBlock.x + Block.BLOCK_WIDTH + 50 && block.x + Block.BLOCK_WIDTH + 50 > otherBlock.x &&
                block.y < otherBlock.y + Block.BLOCK_HEIGHT + 50 && block.y + Block.BLOCK_HEIGHT + 50 > otherBlock.y &&
                block.y > this.blockMergeThreshold) {

                block.ammoValue += otherBlock.ammoValue;
                block.healthValue += otherBlock.healthValue;

                block.x = Math.ceil((block.x + otherBlock.x) / 2);
                block.y = Math.ceil((block.y + otherBlock.y) / 2);

                this.fallingsBlocks.splice(this.fallingsBlocks.indexOf(otherBlock), 1);
            }
        }
    }

    this.fallingsBlocks.forEach(block => {
        block.y += 4 * Math.min(((block.ammoValue + block.healthValue) / 50), 2);
        if (block.x < this.playerShip.x + PlayerShip.SHIP_WIDTH && block.x + Block.BLOCK_WIDTH > this.playerShip.x &&
            block.y < this.canvas.height && block.y + Block.BLOCK_HEIGHT > this.canvas.height - PlayerShip.SHIP_HEIGHT) {
            this.playerShip.health += block.healthValue;
            this.playerShip.ammo = Math.min(this.playerShip.ammo + block.ammoValue, PlayerShip.MAX_AMMO);
            this.fallingsBlocks.splice(this.fallingsBlocks.indexOf(block), 1);
        }
    });
    }

    replay() {
        this.status = 'started';
        this.playerShip.ammo = PlayerShip.DEFAULT_AMMO;
        this.playerShip.health = PlayerShip.DEFAULT_HEALTH;
        this.bullets = [];
        this.aliens = [];
        this.fallingsBlocks = [];
        this.playerShip.reset(this.canvas);
        this.score = 0;
    }

    spawnAlien() {
        const life = Math.floor(Math.random() * 10) + 1;
        const x = Math.random() * (this.canvas.width - Alien.ALIEN_WIDTH);
        this.aliens.push(new Alien(this.ctx, x, 0, life));
    }

    private getAlienSpawnDelay() {
        return Math.max(this.alienSpawnDelay - this.score, 500);
    }
}