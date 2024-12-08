<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
// import type { Alien, Bullet } from './invaders/models';
import { Alien, Block, PlayerShip, Bullet } from './invaders/models';
import GameState from './invaders/gameState';

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

onMounted(() => {
    window.addEventListener('blur', pauseGame);
    window.addEventListener('focus', unPauseGame);
});

onBeforeUnmount(() => {
    window.removeEventListener('blur', pauseGame);
    window.removeEventListener('focus', unPauseGame);
});

function pauseGame() {
    if (game.status === 'started') game.status = 'paused';
}

function unPauseGame() {
    if (game.status === 'paused') {
        game.status = 'started';
        requestAnimationFrame(gameLoop);
    }
}

// Game Constants
const bulletSpeed = 7;
const blockMergeThreshold = 30;
const playerShip = new PlayerShip(props.ctx, props.canvas.width / 2 - PlayerShip.SHIP_WIDTH / 2);

// Game State
let keysPressed: { [Name: string]: boolean } = {};
let fireMode: 'default' | 'double' | 'triple' = "default";
let game = new GameState(props.ctx, props.canvas, 'started', 0, playerShip, [], [], []);

// Handle Input
document.addEventListener('keydown', (e) => keysPressed[e.key] = true);
document.addEventListener('keyup', (e) => keysPressed[e.key] = false);

function spawnAliens() {
    if (game.status !== 'started') return;
    const life = Math.floor(Math.random() * 10) + 1;
    const x = Math.random() * (props.canvas.width - Alien.ALIEN_WIDTH);
    game.aliens.push(new Alien(props.ctx, x, 0, life));
}

function spawnBlock(opt?: { health: number, ammo: number }) {
    if (game.status !== 'started') return;

    const healthValue = opt?.health ?? Math.floor(Math.random() * 5) + 1;
    const ammoValue = opt?.ammo ?? Math.floor(Math.random() * 60) + 10;
    const x = Math.random() * (props.canvas.width - Block.BLOCK_WIDTH);
    game.fallingsBlocks.push(new Block(props.ctx, x, 0, healthValue, ammoValue, kaspaLogo.value!));
}

// Update Game
function update() {
    // Update ship movement
    if ((keysPressed['ArrowLeft'] || keysPressed['a']) && playerShip.x > 0) {
        playerShip.x -= PlayerShip.SHIP_SPEED;
    }
    if ((keysPressed['ArrowRight'] || keysPressed['d']) && playerShip.x < props.canvas.width - PlayerShip.SHIP_WIDTH) {
        playerShip.x += PlayerShip.SHIP_SPEED;
    }

    // Shoot bullets if ammo available and spacebar is held
    if ((keysPressed[' '] || keysPressed['w']) && playerShip.ammo > 0) {
        if (game.bullets.length === 0 || game.bullets[game.bullets.length - 1].y < props.canvas.height - PlayerShip.SHIP_HEIGHT - 30) {
            const bulletType = Math.random() > 0.9 ? 'super' : 'default';
            switch (fireMode) {
                case "default":
                    game.bullets.push(new Bullet(props.ctx, playerShip.x + PlayerShip.SHIP_WIDTH / 2, props.canvas.height - PlayerShip.SHIP_HEIGHT - 10, bulletType));
                    playerShip.ammo--;
                    break;
                case "double":
                    game.bullets.push(new Bullet(props.ctx, playerShip.x, props.canvas.height - PlayerShip.SHIP_HEIGHT - 10, bulletType));
                    game.bullets.push(new Bullet(props.ctx, playerShip.x + PlayerShip.SHIP_WIDTH, props.canvas.height - PlayerShip.SHIP_HEIGHT - 10, bulletType));
                    playerShip.ammo = Math.max(0, playerShip.ammo - 2);
                    break;
                case "triple":
                    game.bullets.push(new Bullet(props.ctx, playerShip.x, props.canvas.height - PlayerShip.SHIP_HEIGHT - 10, bulletType));
                    game.bullets.push(new Bullet(props.ctx, playerShip.x + PlayerShip.SHIP_WIDTH / 2, props.canvas.height - PlayerShip.SHIP_HEIGHT - 10, bulletType));
                    game.bullets.push(new Bullet(props.ctx, playerShip.x + PlayerShip.SHIP_WIDTH, props.canvas.height - PlayerShip.SHIP_HEIGHT - 10, bulletType));
                    playerShip.ammo = Math.max(0, playerShip.ammo - 3);
                    break;
            }
        }
    }

    // Update bullets
    game.bullets = game.bullets.filter(bullet => bullet.y > 0);
    game.bullets.forEach(bullet => bullet.y -= bulletSpeed);

    // Update aliens
    game.aliens.forEach(alien => {
        alien.y += 1;
        game.bullets.forEach((bullet, bIndex) => {
            if (bullet.x > alien.x && bullet.x < alien.x + Alien.ALIEN_WIDTH &&
                bullet.y > alien.y && bullet.y < alien.y + Alien.ALIEN_HEIGHT) {

                if (bullet.type === 'super') {
                    alien.life = 0;
                }
                alien.life--;
                game.bullets.splice(bIndex, 1);
                if (alien.life <= 0) {
                    game.aliens.splice(game.aliens.indexOf(alien), 1);
                    game.score += 10;
                }
            }
        });

        if (alien.y > props.canvas.height) {
            playerShip.health = Math.max(0, playerShip.health - alien.life);
            game.aliens.splice(game.aliens.indexOf(alien), 1);
        }
    });

    game.fallingsBlocks = game.fallingsBlocks.sort((a, b) => a.y - b.y)
    // Update falling blocks
    for (let i = 0; i < game.fallingsBlocks.length; i++) {
        const block = game.fallingsBlocks[i];
        for (let j = i + 1; j < game.fallingsBlocks.length; j++) {
            const otherBlock = game.fallingsBlocks[j];
            if (block.x < otherBlock.x + Block.BLOCK_WIDTH && block.x + Block.BLOCK_WIDTH > otherBlock.x &&
                block.y < otherBlock.y + Block.BLOCK_HEIGHT && block.y + Block.BLOCK_HEIGHT > otherBlock.y &&
                block.y > blockMergeThreshold) {

                block.ammoValue += otherBlock.ammoValue;
                block.healthValue += otherBlock.healthValue;

                block.x = Math.ceil((block.x + otherBlock.x) / 2);
                block.y = Math.ceil((block.y + otherBlock.y) / 2);

                game.fallingsBlocks.splice(game.fallingsBlocks.indexOf(otherBlock), 1);
            }
        }
    }

    game.fallingsBlocks.forEach(block => {
        block.y += 4 * ((block.ammoValue + block.healthValue) / 50);
        if (block.x < playerShip.x + PlayerShip.SHIP_WIDTH && block.x + Block.BLOCK_WIDTH > playerShip.x &&
            block.y < props.canvas.height && block.y + Block.BLOCK_HEIGHT > props.canvas.height - PlayerShip.SHIP_HEIGHT) {
            playerShip.health += block.healthValue;
            playerShip.ammo = Math.min(playerShip.ammo + block.ammoValue, PlayerShip.MAX_AMMO);
            game.fallingsBlocks.splice(game.fallingsBlocks.indexOf(block), 1);
        }
    });
}

// Draw Game
function draw() {
    props.ctx.clearRect(0, 0, props.canvas.width, props.canvas.height);
    game.draw();
}

function replay() {
    game.replay();
    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop() {
    update();
    draw();
    if (playerShip.health > 0 && game.status === 'started') {
        requestAnimationFrame(gameLoop);
    }
    else if (game.status === 'paused') {
        console.log('game paused');
    } else {
        game.status = 'gameOver';
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