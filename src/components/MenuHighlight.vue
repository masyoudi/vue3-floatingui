<template>
  <div>
    <Teleport to="body">
      <Transition v-bind="transition">
        <div v-if="isOpen" ref="mask" class="fixed rounded-lg z-[100]"></div>
      </Transition>
      <div v-if="isOpen" class="fixed inset-0 z-[100]"></div>
    </Teleport>

    <MenuPopover
      v-if="openPopover"
      :target="mask"
      :z-index="101"
      class="bg-slate-900 rounded-lg p-4"
      arrow-class="bg-slate-900"
      strategy="fixed"
      :close-outside="false"
      :offset="15"
      show-on-mounted
    >
      <template #content>
        <p class="text-white">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorem enim cum officia recusandae expedita ipsam libero autem
          obcaecati deleniti, dignissimos sint, in eum accusantium error placeat quidem. At, expedita voluptatem!
        </p>
        <div class="flex justify-end space-x-3 select-none">
          <button class="inline-flex bg-blue-500 text-white text-sm rounded-md py-1 px-5" @click="prev">Back</button>
          <button class="inline-flex bg-blue-500 text-white text-sm rounded-md py-1 px-5" @click="next">
            {{ currentIndex >= steps.length - 1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </template>
    </MenuPopover>
  </div>
</template>

<script setup lang="ts">
import { autoUpdate, computePosition, type Strategy } from '@floating-ui/dom';
import { computed, nextTick, onBeforeUnmount, ref, shallowRef } from 'vue';
import MenuPopover from './MenuPopover.vue';
import { scrollIntoView, toPx } from '../utils';

interface Step {
  target: string;
  strategy: Strategy;
}

const mask = shallowRef<HTMLElement>();
const transition = {
  enterActiveClass: 'transition duration-150 ease-out',
  enterFromClass: 'transform scale-95 opacity-0',
  enterToClass: 'transform scale-100 opacity-100',
  leaveActiveClass: 'transition duration-75 ease-in',
  leaveFromClass: 'transform scale-100 opacity-100',
  leaveToClass: 'transform scale-95 opacity-0'
};
const isOpen = ref(false);
const openPopover = ref(false);
const currentIndex = ref(0);
const cleanup = shallowRef<ReturnType<typeof autoUpdate>>();
const steps: Step[] = [
  {
    target: '[data-tour="1"]',
    strategy: 'fixed'
  },
  {
    target: '[data-tour="2"]',
    strategy: 'absolute'
  },
  {
    target: '[data-tour="3"]',
    strategy: 'absolute'
  },
  {
    target: '[data-tour="7"]',
    strategy: 'absolute'
  },
  {
    target: '[data-tour="9"]',
    strategy: 'absolute'
  },
  {
    target: '[data-tour="13"]',
    strategy: 'absolute'
  },
  {
    target: '[data-tour="23"]',
    strategy: 'absolute'
  }
];
const step = computed(() => steps[currentIndex.value]);
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < steps.length - 1);

const setMask = async (target: Element) => {
  if (!mask.value) {
    return;
  }

  const { x, y } = await computePosition(target, mask.value, {
    placement: 'top-start',
    strategy: 'fixed'
  });
  const { screen } = window;
  const { body } = document;
  const { width, height } = target.getBoundingClientRect();
  const shadowWidth = screen.width > body.scrollHeight ? screen.width : body.scrollHeight;
  const padding = 5;

  mask.value.style.width = toPx(padding * 2 + width);
  mask.value.style.height = toPx(padding * 2 + height);
  mask.value.style.top = toPx(y + height + padding);
  mask.value.style.left = toPx(x - padding);
  mask.value.style.boxShadow = `0 0 0 ${toPx(shadowWidth)} rgba(0, 0, 0, .5)`;
  mask.value.style.background = 'transparent';
};

async function update(index: number) {
  openPopover.value = false;
  currentIndex.value = index;
  await nextTick();
  if (cleanup.value) {
    cleanup.value();
  }

  const target = document.querySelector(step.value.target) as HTMLElement;
  if (!target) {
    return;
  }

  isOpen.value = true;
  await nextTick();
  if (!mask.value) {
    return;
  }

  mask.value.style.background = 'rgba(0, 0, 0, .5)';
  await scrollIntoView(target, { behavior: 'smooth', block: 'center', inline: 'nearest' });
  cleanup.value = autoUpdate(target, mask.value, async () => await setMask(target));
  await nextTick();
  openPopover.value = true;
}

function close() {
  openPopover.value = false;

  if (cleanup.value) {
    cleanup.value();
  }

  isOpen.value = false;
  currentIndex.value = 0;
}

function prev() {
  if (!hasPrev.value) {
    close();
    return;
  }

  update(currentIndex.value - 1);
}

function next() {
  if (!hasNext.value) {
    close();
    return;
  }

  update(currentIndex.value + 1);
}

function open() {
  update(0);
}

defineExpose({ open });

onBeforeUnmount(close);
</script>
