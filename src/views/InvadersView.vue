<script setup lang="ts">
import { ref } from 'vue';
import KaspaConnection from '@/components/Kaspa.Connection.vue';
import Invaders from '@/components/Invaders.vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const invaders = ref<typeof Invaders | null>(null);
const posX = ref(400);
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
                <input id="shipCtrl" type="range" min="-2.5" max="757.5" class="w-full" style="display: none;"
                    v-model.number="posX">
                <button v-if="showReplay" class="border" @click="replay">Replay</button>
            </div>
            <Invaders v-if="canvas" ref="invaders" v-model:ship-x.number="posX" :canvas="canvas"
                :ctx="canvas!.getContext('2d')!" @game-over="showReplay = true" />
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

#shipCtrl {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    margin: 20px 0;
}

#shipCtrl:focus {
    outline: none;
}

/***** Chrome, Safari, Opera and Edge Chromium styles *****/
/* slider track */
#shipCtrl::-webkit-slider-runnable-track {
    background-color: #053a5f;
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider thumb */
#shipCtrl::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* Override default look */
    appearance: none;
    margin-top: -12px;
    /* Centers thumb on the track */

    /*custom styles*/
    background-color: white;
    height: 2rem;
    width: 1rem;
}

#shipCtrl:focus::-webkit-slider-thumb {
    border: 1px solid #053a5f;
    outline: 3px solid #053a5f;
    outline-offset: 0.125rem;
}

/******** Firefox styles ********/
/* slider track */
#shipCtrl::-moz-range-track {
    background-color: #053a5f;
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider thumb */
#shipCtrl::-moz-range-thumb {
    border: none;
    /*Removes extra border that FF applies*/
    border-radius: 0;
    /*Removes default border-radius that FF applies*/

    /*custom styles*/
    background-color: white;
    height: 2rem;
    width: 1rem;
}

#shipCtrl:focus::-moz-range-thumb {
    border: 1px solid #053a5f;
    outline: 3px solid #053a5f;
    outline-offset: 0.125rem;
}
</style>