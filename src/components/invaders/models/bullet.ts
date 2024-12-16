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
                this.ctx.shadowBlur = 2;
                this.ctx.shadowColor = "pink";
                this.ctx.fillStyle = 'red';
                break;
        }
        this.ctx.fillRect(this.x - 2, this.y, 4, 10);
        // this.ctx.beginPath();
        // this.ctx.ellipse(this.x, this.y, 3, 10, 0, 0, 2 * Math.PI);
        // this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "";
    }
}
