<script setup lang="ts">
import * as kaspa from '@/kaspa';
import type { RpcClient } from '@/kaspa';
import { computed, ref } from 'vue';

const client = computed(() => { rpc.value?.isConnected ? rpc.value?.getInfo() : '' });
const isConnected = ref(false);
const msg = ref('')

const emit = defineEmits<{
    blockAdded: [{ hash: string, count: number }]
}>();

let rpc = ref<RpcClient | null>(null);
(async () => {
    await kaspa.default('/kaspa_bg.wasm');

    rpc.value = new kaspa.RpcClient({
        resolver: new kaspa.Resolver(),
        networkId: 'mainnet'
    });

    if (rpc.value == null) return;

    rpc.value.addEventListener("connect", async (event) => {
        console.log("Connected to", rpc.value?.url);
        console.log("Subscribing to Block Added...");
        await rpc.value?.subscribeBlockAdded();
        isConnected.value = true;
    });

    rpc.value.addEventListener("disconnect", async (event) => {
        console.log("Disconnected from", rpc.value?.url);
        console.log("Disconnect", event);
        isConnected.value = false;
    });

    rpc.value.addEventListener("block-added", async (event) => {
        // remove parentsByLevel from header (reduce data output)
        delete event.data.block.header.parentsByLevel;
        msg.value = `${(event.data.block.header.hash as string).substring(0, 10)}...(${event.data.block.transactions.length} transactions)`
        emit('blockAdded', { hash: event.data.block.header.hash, count: event.data.block.transactions.length });
    });

    await rpc.value.connect();

})();
</script>
<template>
    {{ msg }}
</template>