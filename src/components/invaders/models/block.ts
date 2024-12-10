export default class Block {
    public static readonly BLOCK_WIDTH = 40;
    public static readonly BLOCK_HEIGHT = 40;

    constructor(private ctx: CanvasRenderingContext2D, public x: number, public y: number, public healthValue: number, public ammoValue: number) { }

    draw() {
        // this.ctx.fillStyle = 'blue';
        // this.ctx.fillRect(this.x, this.y, Block.BLOCK_WIDTH, Block.BLOCK_HEIGHT);

        const pattern = [
            "    xx    ",
            "  xxxxxx  ",
            " xx xx xx ",
            " xxx x xx ",
            "xxxxx  xxx",
            "xxxxx  xxx",
            " xxx x xx ",
            " xx xx xx ",
            "  xxxxxx  ",
            "    xx    ",
        ];
        this.ctx.fillStyle = "#6fc7ba";
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 'x') {
                    this.ctx.fillRect(this.x + col * (Block.BLOCK_WIDTH / pattern[row].length), this.y + row * (Block.BLOCK_HEIGHT / pattern.length), 4, 4);
                }
            }
        }
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = "center";
        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillText(`${this.ammoValue}`, this.x + Block.BLOCK_WIDTH / 2, this.y - 5);
        // this.ctx.fillStyle = 'white';
        // this.ctx.fillText(`${this.y}`, this.x, this.y);
        // this.ctx.strokeStyle = 'blue';
        // this.ctx.strokeRect(this.x, this.y, Block.BLOCK_WIDTH, Block.BLOCK_HEIGHT);
    }
}