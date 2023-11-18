<template>
  <div class="relative">
    <Teleport to="body">
      <Transition v-bind="transition" @after-enter="initMask">
        <div v-if="mounted" ref="mask" class="absolute rounded-xl"></div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { autoUpdate, computePosition } from '@floating-ui/dom';
import { onMounted, ref } from 'vue';

const mask = ref<HTMLElement>();
const transition = {
  enterActiveClass: 'transition duration-150 ease-out',
  enterFromClass: 'transform scale-95 opacity-0',
  enterToClass: 'transform scale-100 opacity-100',
  leaveActiveClass: 'transition duration-75 ease-in',
  leaveFromClass: 'transform scale-100 opacity-100',
  leaveToClass: 'transform scale-95 opacity-0'
};
const mounted = ref(false);
const toPx = (value: number | string, important: boolean = false) => `${value}px ${important ? '!important' : ''}`;
const update = async (target: Element) => {
  if (!mask.value) {
    return;
  }

  const { x, y } = await computePosition(target, mask.value, {
    placement: 'top-start',
    strategy: 'absolute'
  });
  const { screen } = window;
  const { body } = document;
  const { width, height } = target.getBoundingClientRect();
  const shadowWidth = screen.width > body.scrollHeight ? screen.width : body.scrollHeight;

  mask.value.style.width = toPx(width);
  mask.value.style.height = toPx(height);
  mask.value.style.top = toPx(y);
  mask.value.style.left = toPx(x);
  mask.value.style.boxShadow = `0 0 0 ${toPx(shadowWidth)} rgba(0, 0, 0, .5)`;
};

const initMask = async () => {
  await Promise.resolve(() => setTimeout(() => {}, 250));
  if (!mask.value) {
    return;
  }

  const target = document.querySelector('[data-tour="1"]') as Element;

  autoUpdate(target, mask.value, async () => await update(target));
};

onMounted(async () => {
  mounted.value = true;
});
</script>
