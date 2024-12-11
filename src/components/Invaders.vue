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
let game = new GameState(props.ctx, props.canvas, 'started', 0, playerShip, [], [], []);

// Handle Input
document.addEventListener('keydown', (e) => updateKeysPressed(e, true));
document.addEventListener('keyup', (e) => updateKeysPressed(e, false));

function updateKeysPressed(e: KeyboardEvent, state: boolean) {
    const { key } = e;
    keysPressed[key] = state;

    if (key === ' ') {
        e.preventDefault();
    }

    if (key == 'm' && state == false) {
        game.playerShip.switchFireMode();
    }
}

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
    game.fallingsBlocks.push(new Block(props.ctx, x, 0, healthValue, ammoValue));
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
            switch (game.playerShip.fireMode) {
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
            if (block.x < otherBlock.x + Block.BLOCK_WIDTH + 50 && block.x + Block.BLOCK_WIDTH + 50 > otherBlock.x &&
                block.y < otherBlock.y + Block.BLOCK_HEIGHT + 50 && block.y + Block.BLOCK_HEIGHT + 50 > otherBlock.y &&
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
        block.y += 4 * Math.min(((block.ammoValue + block.healthValue) / 50), 2);
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
    props.ctx.reset();

    update();
    draw();
    if (playerShip.health > 0 && game.status === 'started') {
        requestAnimationFrame(gameLoop);
    }
    else if (game.status === 'paused') {
        console.log('game paused');
        const imgData = props.ctx.getImageData(0, 0, props.ctx.canvas.width, props.ctx.canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        props.ctx.putImageData(imgData, 0, 0);
        props.ctx.fillStyle = 'white';
        props.ctx.font = '40px "Press Start 2P"';
        props.ctx.textAlign = "center";
        props.ctx.fillText('Paused', props.canvas.width / 2, props.canvas.height / 2);
        props.ctx.textAlign = "start";
    } else {
        game.status = 'gameOver';
        props.ctx.fillStyle = 'red';
        props.ctx.font = '40px "Press Start 2P"';
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
</template>