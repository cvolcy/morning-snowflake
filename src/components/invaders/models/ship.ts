export default class PlayerShip {
    public static readonly SHIP_WIDTH = 45;
    public static readonly SHIP_HEIGHT = 25;
    public static readonly SHIP_SPEED = 5;
    public static readonly DEFAULT_AMMO = 500;
    public static readonly MAX_AMMO = 1000;
    public static readonly DEFAULT_HEALTH = 100;

    private readonly pattern = [
        "    xx    ",
        "   xxxx   ",
        "  xxxxxx  ",
        " xx xx xx ",
        "xxxxxxxxxx"
    ];

    constructor(private ctx: CanvasRenderingContext2D, public x: number, public ammo: number = PlayerShip.DEFAULT_AMMO, public health: number = PlayerShip.DEFAULT_HEALTH) { }

    draw() {
        this.ctx.fillStyle = 'white';
        for (let row = 0; row < this.pattern.length; row++) {
            for (let col = 0; col < this.pattern[row].length; col++) {
                if (this.pattern[row][col] === 'x') {
                    this.ctx.fillRect(this.x + col * (PlayerShip.SHIP_WIDTH / this.pattern[row].length), this.ctx.canvas.height - PlayerShip.SHIP_HEIGHT + row * (PlayerShip.SHIP_HEIGHT / this.pattern.length), 4, 4)
                }
            }
        }
        // this.ctx.strokeStyle = "blue";
        // this.ctx.strokeRect(this.x, this.ctx.canvas.height - PlayerShip.SHIP_HEIGHT, PlayerShip.SHIP_WIDTH, PlayerShip.SHIP_HEIGHT);
    }

    reset(canvas: HTMLCanvasElement) {
        this.ammo = PlayerShip.DEFAULT_AMMO;
        this.health = PlayerShip.DEFAULT_HEALTH;
        this.x = canvas.width / 2 - PlayerShip.SHIP_WIDTH / 2;
    }
}