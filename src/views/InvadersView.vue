<script setup lang="ts">
import { computed, ref } from 'vue';
import KaspaConnection from '@/components/Kaspa.Connection.vue';
import Invaders from '@/components/Invaders.vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const invaders = ref<typeof Invaders | null>(null);
const showReplay = ref(false);

function onBlockAdded(block: { hash: string, count: number }) {
    if (invaders.value != null) {
        invaders.value.spawnBlock({
            health: 1,
            ammo: block.count
        })
    }
}

function replay() {
    invaders.value?.replay();
    showReplay.value = false;
}
</script>
<template>
    <div class="invaders-container container">
        <p>
            Use ⬅️ and ➡️ to move around.
            use space bar to shoot. <br>
            Kaspa blocks give 1 health and 1 ammo per transaction in the block.<br>
            You loose health for each health point of each alien reaching the bottom.
        </p>
        <div class="canvas-container">
            <canvas ref="canvas" width="800" height="600"></canvas>
            <button v-if="showReplay" @click="replay">Replay</button>
        </div>
        <Invaders ref="invaders" v-if="canvas" :canvas="canvas" :ctx="canvas!.getContext('2d')!"
            @game-over="showReplay = true" />
        <KaspaConnection @block-added="onBlockAdded" />
    </div>
</template>
<style scoped>
.canvas-container {
    position: relative;
}

.canvas-container button {
    position: absolute;
    top: calc(50% + 20px);
    width: 100px;
    height: 50px;
    left: calc(50% - 100px / 2);
}

canvas {
    width: 100%;
    display: block;
    margin: 0 auto;
    background: black;
    border: 2px solid white;
}
</style>
<style>
body {
    margin: 0;
    font-family: Arial, sans-serif;
    color: white;
    text-align: center;
    background-color: #111;
}
</style>