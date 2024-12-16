<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from "@iconify/vue";
import { useClipboard, useWindowScroll } from '@vueuse/core';
import { nextTick, ref } from 'vue';

const source = ref('kaspa:qzjl89yak9wkmpavn2rsfasuwcp85fslwd2e35glsuzrn0j4y6uwxzm2kekrw')
const { copy } = useClipboard({ source, legacy: true });
const { y } = useWindowScroll()

const showQrCode = ref(false);
function toggleQrCode() {
  showQrCode.value = !showQrCode.value;
  if (showQrCode.value) {
    nextTick(() => {
      y.value = y.value + 200;
    });
  }
}
</script>

<template>
  <div class="bg-background min-h-dvh">
    <RouterView />
    <footer>
      <div class="container text-center">
        <div class="pt-5">
          <p class="mb-2">
            Show Support
            <Icon class="inline text-red-500" icon="lucide:heart" width="18" height="18" />
          </p>
          <div class="flex flex-row flex-wrap justify-center">
            <span class="text-[#14f1d9]">kaspa:</span>qzjl89yak9wkmpavn2rsfasuwcp85fslwd2e35glsuzrn0j4y6uwx<span
              class="text-[#14f1d9]">zm2kekrw</span>
            <a class="d-inline mx-1 hover:text-[#14f1d9]" href="javascript:void(0)" @click="copy(source)">
              <Icon icon="lucide:copy" width="18" height="18" />
            </a>
            <a class="d-inline mx-1 hover:text-[#14f1d9]" href="javascript:void(0)" @click="toggleQrCode">
              <Icon icon="lucide:qr-code" width="18" height="18" />
            </a>
            <div v-if="showQrCode" class="w-full flex justify-center">
              <img src="/kas-wallet.svg" width="200" height="200" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
<style>
html,
body,
#app {
  height: 100%;
}
</style>