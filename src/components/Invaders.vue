<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
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

const shipX = defineModel<number>('ship-x',);
watch(shipX, () => {
    game.playerShip.x = shipX.value ?? game.playerShip.x;
})

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
    if (game.status === 'paused' && !game.forcedPause) {
        game.status = 'started';
        requestAnimationFrame(gameLoop);
    }
}

// Game Constants
const playerShip = new PlayerShip(props.ctx, props.canvas.width / 2 - PlayerShip.SHIP_WIDTH / 2);

// Game State
let keysPressed: { [Name: string]: boolean } = {};
let game = new GameState(props.ctx, props.canvas, 'started', 0, playerShip, [], [], []);

// Handle Input
document.addEventListener('keydown', (e) => updateKeysPressed(e, true));
document.addEventListener('keyup', (e) => updateKeysPressed(e, false));
props.canvas.addEventListener('touchstart', () => updateKeysPressed({ key: ' ', preventDefault() { } } as KeyboardEvent, true));
props.canvas.addEventListener('mousedown', () => updateKeysPressed({ key: ' ', preventDefault() { } } as KeyboardEvent, true));
document.addEventListener('touchend', () => updateKeysPressed({ key: ' ', preventDefault() { } } as KeyboardEvent, false));
document.addEventListener('mouseup', () => updateKeysPressed({ key: ' ', preventDefault() { } } as KeyboardEvent, false));
props.canvas.addEventListener('mousemove', (e) => { shipX.value = e.clientX - props.canvas.getBoundingClientRect().left - (PlayerShip.SHIP_WIDTH / 2); });
props.canvas.addEventListener('touchmove', (e) => { shipX.value = e.touches[0].clientX - props.canvas.getBoundingClientRect().left - (PlayerShip.SHIP_WIDTH / 2); });

function updateKeysPressed(e: KeyboardEvent, state: boolean) {
    const { key } = e;
    keysPressed[key] = state;

    if (key === ' ') {
        e.preventDefault();
    }

    if (key == 'm' && state == false) {
        game.playerShip.switchFireMode();
    }

    if (key === 'Escape' && game.status !== 'gameOver' && state == false) {
        if (game.status === 'paused') {
            game.forcedPause = false;
            unPauseGame();
        }
        else {
            game.forcedPause = true;
            pauseGame();
        }
    }
}

function spawnBlock(opt?: { health: number, ammo: number }) {
    if (game.status !== 'started') return;

    const healthValue = opt?.health ?? Math.floor(Math.random() * 5) + 1;
    const ammoValue = opt?.ammo ?? Math.floor(Math.random() * 60) + 10;
    const x = Math.random() * (props.canvas.width - Block.BLOCK_WIDTH);
    game.fallingsBlocks.push(new Block(props.ctx, x, 0, healthValue, ammoValue));
}

// Update Game
function update(currentTime: number) {
    // Update ship movement
    if ((keysPressed['ArrowLeft'] || keysPressed['a']) && playerShip.x > 0) {
        playerShip.x -= PlayerShip.SHIP_SPEED;
        shipX.value = playerShip.x;
    }
    if ((keysPressed['ArrowRight'] || keysPressed['d']) && playerShip.x < props.canvas.width - PlayerShip.SHIP_WIDTH) {
        playerShip.x += PlayerShip.SHIP_SPEED;
        shipX.value = playerShip.x;
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

    game.update(currentTime);
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
function gameLoop(currentTime: number) {
    props.ctx.reset();

    update(currentTime);
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
gameLoop(performance.now());
</script>
<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Press+Start+2P&display=swap"
        rel="stylesheet">
</template>