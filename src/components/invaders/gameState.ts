import { PlayerShip, type Alien, type Block, type Bullet } from "./models";

export default class GameState {
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
        this.ctx.fillText(`x: ${this.playerShip.x}`, this.canvas.width - 150, 60);
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
}