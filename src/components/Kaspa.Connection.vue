<script setup lang="ts">
import * as kaspa from '@/kaspa';
import { Resolver } from '@/kaspa';
import type { RpcClient } from '@/kaspa';
import { ref } from 'vue';

const isConnected = ref(false);
const msg = ref('')

const emit = defineEmits<{
    blockAdded: [{ hash: string, count: number }]
}>();

let rpc = ref<RpcClient | null>(null);
(async () => {

    console.log('loading kaspa sdk');

    await kaspa.default('/kaspa_bg.wasm');

    console.log('kaspa sdk loaded');

    rpc.value = new kaspa.RpcClient({
        resolver: new Resolver(),
        networkId: 'mainnet'
    });

    console.log(rpc.value);

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

    console.log('connecting rpc');

    await rpc.value.connect();

    console.log('connected rpc');

})();
</script>
<template>
    {{ msg }}
</template>