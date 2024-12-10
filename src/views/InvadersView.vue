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
    <div class="invaders-container container flex justify-center text-center">
        <div class="rounded-[0.5rem] border bg-background shadow inline-flex flex-col my-6 p-6">
            <div class="canvas-container">
                <canvas ref="canvas" width="800" height="600"></canvas>
                <button v-if="showReplay" class="border" @click="replay">Replay</button>
            </div>
            <Invaders ref="invaders" v-if="canvas" :canvas="canvas" :ctx="canvas!.getContext('2d')!"
                @game-over="showReplay = true" />
            <KaspaConnection @block-added="onBlockAdded" />
            <p class="mt-2">
                Use ⬅️ and ➡️ to move around.
                use space bar to shoot. <br>
                Kaspa blocks give 1 health and 1 ammo per transaction in the block.<br>
                You loose health for each health point of each alien reaching the bottom.
            </p>
        </div>
    </div>
</template>
<style scoped>
.canvas-container {
    position: relative;
    max-height: calc(100dvh - 80px);
}

.canvas-container button {
    position: absolute;
    top: calc(50% + 20px);
    width: 100px;
    height: 50px;
    left: calc(50% - 100px / 2);
}

canvas {
    max-width: 100%;
    max-height: 100%;
    display: block;
    margin: 0 auto;
    background: black;
    border: 2px solid white;
}
</style>