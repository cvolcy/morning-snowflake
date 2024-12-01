<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Santa from '@/components/Santa.vue';
import KaspaConnection from '@/components/Kaspa.Connection.vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const santa = ref<typeof Santa | null>(null);

onMounted(() => {
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCanvas);
})

function resizeCanvas() {
  canvas.value!.width = window.innerWidth;
  canvas.value!.height = window.innerHeight;
}

function onBlockAdded(block: { hash: string, count: number }) {
  if (santa.value != null) {
    santa.value.shootGift(block);
  }
}
</script>
<template>
  <main class="flex w-full">
    <div class="flex w-full">
      <div class="flex-none w-14">
        <canvas ref="canvas" style="width: 100%;"></canvas>
      </div>
      <div class="flex-1">
        <KaspaConnection @block-added="onBlockAdded" />
      </div>
    </div>
    <Santa ref="santa" v-if="canvas" :canvas="canvas" :ctx="canvas!.getContext('2d')!" />
  </main>
</template>
<style scoped>
canvas {
  background: linear-gradient(to bottom, #042421, #409f89, #dbdbdb)
}
</style>
