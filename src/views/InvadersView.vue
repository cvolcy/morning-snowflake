<script setup lang="ts">
import { computed, ref } from 'vue';
import KaspaConnection from '@/components/Kaspa.Connection.vue';
import Invaders from '@/components/Invaders.vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const invaders = ref<typeof Invaders | null>(null);

function onBlockAdded(block: { hash: string, count: number }) {
    if (invaders.value != null) {
        invaders.value.spawnBlock({
            health: 1,
            ammo: block.count
        })
    }
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
        <canvas ref="canvas" width="800" height="600"></canvas>
        <Invaders ref="invaders" v-if="canvas" :canvas="canvas" :ctx="canvas!.getContext('2d')!" />
        <KaspaConnection @block-added="onBlockAdded" />
    </div>
</template>
<style scoped>
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