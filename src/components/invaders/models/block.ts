export default class Block {
    public static readonly BLOCK_WIDTH = 80;
    public static readonly BLOCK_HEIGHT = 80;

    constructor(private ctx: CanvasRenderingContext2D, public x: number, public y: number, public healthValue: number, public ammoValue: number, public kaspaLogo: HTMLImageElement) { }

    draw() {
        // this.ctx.fillStyle = 'blue';
        // this.ctx.fillRect(this.x, this.y, Block.BLOCK_WIDTH, Block.BLOCK_HEIGHT);
        this.ctx.drawImage(this.kaspaLogo, this.x, this.y, Block.BLOCK_WIDTH, Block.BLOCK_HEIGHT);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`${this.ammoValue}`, this.x + Block.BLOCK_WIDTH / 2 - 6, this.y + 15);
        // this.ctx.fillStyle = 'white';
        // this.ctx.fillText(`${this.y}`, this.x, this.y);
        // this.ctx.strokeStyle = 'blue';
        // this.ctx.strokeRect(this.x, this.y, Block.BLOCK_WIDTH, Block.BLOCK_HEIGHT);
    }
}