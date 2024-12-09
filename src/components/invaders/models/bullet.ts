export default class Bullet {
    constructor(private ctx: CanvasRenderingContext2D, public x: number, public y: number, public type?: 'default' | 'super') { }

    draw() {
        switch (this.type) {
            case 'super':
                this.ctx.fillStyle = 'lightblue';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = "white";
                break;
            default:
                this.ctx.fillStyle = 'red';
                break;
        }
        this.ctx.fillRect(this.x - 2, this.y, 4, 10);

        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "";
    }
}
