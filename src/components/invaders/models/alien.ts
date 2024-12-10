let alienDefaultColors: Array<string|CanvasGradient> = ["#2d383e", "#f79724"];

export default class Alien {
    public static readonly ALIEN_WIDTH = 40;
    public static readonly ALIEN_HEIGHT = 30;

    constructor(private ctx: CanvasRenderingContext2D, public x: number, public y: number, public life: number, private color?: string | CanvasGradient) {
        if (alienDefaultColors.length <= 2) {
            const grad1 = ctx.createLinearGradient(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            grad1.addColorStop(0, "#c63cf4");
            grad1.addColorStop(0.5, "#758dd2");
            grad1.addColorStop(1, "#22e5b2");
            alienDefaultColors.push(grad1);
        }
        this.color ??= alienDefaultColors[Math.floor(Math.random() * alienDefaultColors.length)];
    }

    draw() {
        // Draw alien pixel art
        this.ctx.fillStyle = this.color!;
        this.drawAlien(this.x, this.y);
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = "center";
        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillText(this.life.toString(), this.x + Alien.ALIEN_WIDTH / 2, this.y + Alien.ALIEN_HEIGHT + 10);
        // this.ctx.strokeStyle = "blue";
        // this.ctx.strokeRect(this.x, this.y, Alien.ALIEN_WIDTH, Alien.ALIEN_HEIGHT);
    }
    drawAlien(x: number, y: number) {
        const pattern = [
            "  xx  xx  ",
            " xxxxxxxx ",
            "xxxxxxxxxx",
            "x xx  xx x",
            "xxxxxxxxxx",
            "  x    x  "
        ];
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 'x') {
                    this.ctx.fillRect(x + col * (Alien.ALIEN_WIDTH / pattern[row].length), y + row * (Alien.ALIEN_HEIGHT / pattern.length), 4, 4);
                }
            }
        }
    }
}