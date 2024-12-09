<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}>();
defineExpose({
    spawnBlock,
    replay
});
const emit = defineEmits<{
    gameOver: []
}>();

const kaspaLogo = ref<HTMLImageElement | null>(null);

interface Bullet {
    x: number,
    y: number,
    type?: 'default' | 'super'
}

onMounted(() => {
    window.addEventListener('blur', pauseGame);
    window.addEventListener('focus', unPauseGame);
});

onBeforeUnmount(() => {
    window.removeEventListener('blur', pauseGame);
    window.removeEventListener('focus', unPauseGame);
});

function pauseGame() {
    if (gameState === 'started') gameState = 'paused';
}

function unPauseGame() {
    if (gameState === 'paused') {
        gameState = 'started';
        requestAnimationFrame(gameLoop);
    }
}

// Game Constants
const shipWidth = 50;
const shipHeight = 30;  // Increased for ship sprite
const shipSpeed = 5;
const bulletSpeed = 7;
const alienWidth = 40;
const alienHeight = 30;  // Increased for alien sprite
const blockWidth = 80;
const blockHeight = 80;
const maxAmmo = 1000;
const blockMergeThreshold = 30;

// Game State
let gameState: 'started' | 'gameOver' | 'paused' = 'started';
let shipX = props.canvas.width / 2 - shipWidth / 2;
let bullets: Bullet[] = [];
let aliens: Alien[] = [];
let fallingBlocks: Block[] = [];
let score = 0;
let shipHealth = -1;
let shipAmmo = 1000;
let keysPressed: { [Name: string]: boolean } = {};
let fireMode: 'default' | 'double' | 'triple' = "default";

// Alien class
class Alien {
    constructor(public x: number, public y: number, public life: number, private color: string | CanvasGradient) { }

    draw() {
        // Draw alien pixel art
        props.ctx.fillStyle = this.color;
        this.drawAlien(this.x, this.y);
        props.ctx.fillStyle = 'white';
        props.ctx.fillText(this.life.toString(), this.x + 12, this.y + alienHeight + 10);
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
                    props.ctx.fillRect(x + col * 4, y + row * 4, 4, 4);
                }
            }
        }
    }
}

// Block class
class Block {
    constructor(public x: number, public y: number, public healthValue: number, public ammoValue: number) { }

    draw() {
        // props.ctx.fillStyle = 'blue';
        // props.ctx.fillRect(this.x, this.y, blockWidth, blockHeight);
        props.ctx.drawImage(kaspaLogo.value!, this.x, this.y, blockWidth, blockHeight);
        props.ctx.fillStyle = 'white';
        props.ctx.fillText(`${this.ammoValue}`, this.x + blockWidth / 2 - 6, this.y + 15);
        // props.ctx.fillStyle = 'white';
        // props.ctx.fillText(`${this.y}`, this.x, this.y);
        // props.ctx.strokeStyle = 'blue';
        // props.ctx.strokeRect(this.x, this.y, blockWidth, blockHeight);
    }
}

// Handle Input
document.addEventListener('keydown', (e) => keysPressed[e.key] = true);
document.addEventListener('keyup', (e) => keysPressed[e.key] = false);

const grad1 = props.ctx.createLinearGradient(0, 120, 0, 50);
grad1.addColorStop(0, "#c63cf4");
grad1.addColorStop(0.5, "#758dd2");
grad1.addColorStop(1, "#22e5b2");
const alienDefaultColor = ["#2d383e", "#f79724", grad1];
function spawnAliens() {
    if (gameState !== 'started') return;
    const life = Math.floor(Math.random() * 10) + 1;
    const x = Math.random() * (props.canvas.width - alienWidth);
    aliens.push(new Alien(x, 0, life, alienDefaultColor[Math.floor(Math.random() * alienDefaultColor.length)]));
}

function spawnBlock(opt?: { health: number, ammo: number }) {
    if (gameState !== 'started') return;

    const healthValue = opt?.health ?? Math.floor(Math.random() * 5) + 1;
    const ammoValue = opt?.ammo ?? Math.floor(Math.random() * 60) + 10;
    const x = Math.random() * (props.canvas.width - blockWidth);
    fallingBlocks.push(new Block(x, 0, healthValue, ammoValue));
}

// Update Game
function update() {
    // Update ship movement
    if ((keysPressed['ArrowLeft'] || keysPressed['a']) && shipX > 0) {
        shipX -= shipSpeed;
    }
    if ((keysPressed['ArrowRight'] || keysPressed['d']) && shipX < props.canvas.width - shipWidth) {
        shipX += shipSpeed;
    }

    // Shoot bullets if ammo available and spacebar is held
    if ((keysPressed[' '] || keysPressed['w']) && shipAmmo > 0) {
        if (bullets.length === 0 || bullets[bullets.length - 1].y < props.canvas.height - shipHeight - 30) {
            const bulletType = Math.random() > 0.9 ? 'super' : 'default';
            switch (fireMode) {
                case "default":
                    bullets.push({ x: shipX + shipWidth / 2, y: props.canvas.height - shipHeight - 10, type: bulletType });
                    shipAmmo--;
                    break;
                case "double":
                    bullets.push({ x: shipX, y: props.canvas.height - shipHeight - 10, type: bulletType });
                    bullets.push({ x: shipX + shipWidth, y: props.canvas.height - shipHeight - 10, type: bulletType });
                    shipAmmo = Math.max(0, shipAmmo - 2);
                    break;
                case "triple":
                    bullets.push({ x: shipX, y: props.canvas.height - shipHeight - 10, type: bulletType });
                    bullets.push({ x: shipX + shipWidth / 2, y: props.canvas.height - shipHeight - 10, type: bulletType });
                    bullets.push({ x: shipX + shipWidth, y: props.canvas.height - shipHeight - 10, type: bulletType });
                    shipAmmo = Math.max(0, shipAmmo - 3);
                    break;
            }
        }
    }

    // Update bullets
    bullets = bullets.filter(bullet => bullet.y > 0);
    bullets.forEach(bullet => bullet.y -= bulletSpeed);

    // Update aliens
    aliens.forEach(alien => {
        alien.y += 1;
        bullets.forEach((bullet, bIndex) => {
            if (bullet.x > alien.x && bullet.x < alien.x + alienWidth &&
                bullet.y > alien.y && bullet.y < alien.y + alienHeight) {

                if (bullet.type === 'super') {
                    alien.life = 0;
                }
                alien.life--;
                bullets.splice(bIndex, 1);
                if (alien.life <= 0) {
                    aliens.splice(aliens.indexOf(alien), 1);
                    score += 10;
                }
            }
        });

        if (alien.y > props.canvas.height) {
            shipHealth = Math.max(0, shipHealth - alien.life);
            aliens.splice(aliens.indexOf(alien), 1);
        }
    });

    fallingBlocks = fallingBlocks.sort((a, b) => a.y - b.y)
    // Update falling blocks
    for (let i = 0; i < fallingBlocks.length; i++) {
        const block = fallingBlocks[i];
        for (let j = i + 1; j < fallingBlocks.length; j++) {
            const otherBlock = fallingBlocks[j];
            if (block.x < otherBlock.x + blockWidth && block.x + blockWidth > otherBlock.x &&
                block.y < otherBlock.y + blockHeight && block.y + blockHeight > otherBlock.y &&
                block.y > blockMergeThreshold) {

                block.ammoValue += otherBlock.ammoValue;
                block.healthValue += otherBlock.healthValue;

                block.x = Math.ceil((block.x + otherBlock.x) / 2);
                block.y = Math.ceil((block.y + otherBlock.y) / 2);

                fallingBlocks.splice(fallingBlocks.indexOf(otherBlock), 1);
            }
        }
    }

    fallingBlocks.forEach(block => {
        block.y += 4 * ((block.ammoValue + block.healthValue) / 50);
        if (block.x < shipX + shipWidth && block.x + blockWidth > shipX &&
            block.y < props.canvas.height && block.y + blockHeight > props.canvas.height - shipHeight) {
            shipHealth += block.healthValue;
            shipAmmo = Math.min(shipAmmo + block.ammoValue, maxAmmo);
            fallingBlocks.splice(fallingBlocks.indexOf(block), 1);
        }
    });
}

// Draw Game
function draw() {
    props.ctx.clearRect(0, 0, props.canvas.width, props.canvas.height);

    // Draw ship
    props.ctx.fillStyle = 'white';
    drawShip(shipX, props.canvas.height - shipHeight);

    // Draw bullets
    bullets.forEach(bullet => {
        switch (bullet.type) {
            case 'super':
                props.ctx.fillStyle = 'lightblue';
                props.ctx.shadowBlur = 10;
                props.ctx.shadowColor = "white";
                break;
            default:
                props.ctx.fillStyle = 'red';
                break;
        }
        props.ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);

        props.ctx.shadowBlur = 0;
        props.ctx.shadowColor = "";
    });

    // Draw aliens
    aliens.forEach(alien => alien.draw());

    // Draw falling blocks
    fallingBlocks.forEach(block => block.draw());

    // Draw score, health, and ammo
    props.ctx.fillStyle = 'white';
    props.ctx.font = '13px "Press Start 2P"';
    props.ctx.fillText(`Score: ${score}`, 10, 30);
    props.ctx.fillText(`Health: ${shipHealth}`, props.canvas.width - 300, 30);
    props.ctx.fillText(`Ammo: ${shipAmmo}`, props.canvas.width - 150, 30);
}

function drawShip(x: number, y: number) {
    const pattern = [
        "    xx    ",
        "   xxxx   ",
        "  xxxxxx  ",
        " xx xx xx ",
        "xxxxxxxxxx"
    ];
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 'x') {
                props.ctx.fillRect(x + col * 4, y + row * 4, 4, 4);
            }
        }
    }
}

function replay() {
    gameState = 'started';
    shipAmmo = 100;
    shipHealth = 100;
    bullets = [];
    aliens = [];
    fallingBlocks = [];
    shipX = props.canvas.width / 2;
    score = 0;

    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop() {
    update();
    draw();
    if (shipHealth > 0 && gameState === 'started') {
        requestAnimationFrame(gameLoop);
    }
    else if (gameState === 'paused') {
        console.log('game paused');
    } else {
        gameState = 'gameOver';
        props.ctx.fillStyle = 'red';
        props.ctx.font = '40px Arial';
        props.ctx.textAlign = "center";
        props.ctx.fillText('Game Over!', props.canvas.width / 2, props.canvas.height / 2);
        props.ctx.textAlign = "start";

        emit('gameOver');
    }
}

// Start game
setInterval(spawnAliens, 1000);
// setInterval(spawnBlock, 5000);
gameLoop();
</script>
<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Press+Start+2P&display=swap"
        rel="stylesheet">
    <img ref="kaspaLogo" src="/kaspa-logo.svg" alt="" style="visibility: hidden; width: 0; height: 0;">
</template>