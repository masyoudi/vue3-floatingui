<template>
  <div class="relative">
    <slot>
      <div class="flex justify-end">
        <button class="inline-flex bg-red-500 text-white text-sm rounded-full py-1 px-[0.6rem]" @click="onClose">X</button>
      </div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa debitis atque magni eveniet, dolor voluptate accusamus iusto
        laborum, cum nostrum velit vero tempore ullam doloribus maiores necessitatibus sint? Non, quidem?
      </p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const close = inject('close');

function onClose() {
  if (typeof close === 'function') {
    close();
  }
}
</script>
