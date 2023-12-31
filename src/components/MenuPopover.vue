<template>
  <slot :open="open" :close="close" />

  <Teleport to="body">
    <Transition v-bind="transitionValue">
      <div v-if="displayIf" v-show="displayShow" ref="floatingRef" :style="{ ...floatingStyles, maxWidth }">
        <div v-if="isShowArrow" ref="arrowRef" :class="arrowClasses" :style="arrowStyles"></div>
        <div :class="['relative w-full z-1', contentClasses]">
          <slot name="content" :close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { ComputePositionConfig } from '@floating-ui/dom';
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, useAttrs } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { Popover } from '../types/popover';
import { toPx, popoverTransition } from '../utils';

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Popover>(), {
  strategy: 'absolute',
  isContextMenu: false,
  displayDirective: 'if',
  showArrow: true,
  shift: () => ({ padding: 15, mainAxis: false }),
  flip: () => ({}),
  arrowClass: 'bg-slate-200 z-1',
  contentClass: 'bg-white shadow-lg rounded-lg border border-slate-200/80 p-4',
  closeOutside: true,
  offset: 8,
  width: 350,
  arrowSize: 15
});
const attrs = useAttrs();

const isOpen = ref(false);
const floatingRef = ref();
const floatingAxis = ref({
  x: 0,
  y: 0
});
const arrowRef = ref();
const arrowAxis = ref({
  x: 0,
  y: 0
});
const currentTarget = shallowRef();
const currentPlacement = shallowRef(props.placement ?? 'bottom');
const maxWidth = shallowRef(props.width ? (typeof props.width === 'number' ? toPx(props.width) : props.width) : 350);
const cleanup = shallowRef<ReturnType<typeof autoUpdate>>();

const isFixed = computed(() => props.strategy === 'fixed');
const transitionValue = computed(() => {
  if (!props.transition) {
    return popoverTransition;
  }
  return typeof props.transition === 'string' ? { name: props.transition } : props.transition;
});
const floatingStyles = computed(() => {
  const result: Record<string, string | number> = {
    position: isFixed.value ? 'fixed' : 'absolute',
    width: '100%',
    top: toPx(floatingAxis.value.y),
    left: toPx(floatingAxis.value.x),
    zIndex: props.zIndex ? props.zIndex : 50
  };

  return result;
});
const arrowStyles = computed(() => {
  const arrowLen = arrowRef?.value?.offsetWidth ?? 0;
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[currentPlacement.value.split('-')[0]] as string;

  const result: Record<string, string | number> = {
    position: 'absolute',
    width: toPx(props.arrowSize),
    height: toPx(props.arrowSize),
    left: arrowAxis.value.x > 0 ? toPx(arrowAxis.value.x) : '',
    top: arrowAxis.value.y > 0 ? toPx(arrowAxis.value.y) : '',
    right: '',
    bottom: '',
    [staticSide]: toPx(-arrowLen / 2),
    transform: 'rotate(45deg)'
  };

  return result;
});
const contentClasses = computed(() => (attrs.class ? attrs.class : props.contentClass));
const arrowClasses = computed(() => props.arrowClass);
const isShowArrow = computed(() => props.showArrow);
const displayIf = computed(() => isOpen.value || props.displayDirective !== 'if');
const displayShow = computed(() => isOpen.value || props.displayDirective !== 'show');

/**
 * Get reference element floating UI
 * @param value - Reference value: `MouseEvent` | `HTMLElement`
 */
function getReference(value: MouseEvent | HTMLElement) {
  if (value instanceof HTMLElement) {
    return value;
  }

  if (value.target instanceof HTMLElement && !props.isContextMenu) {
    return value.target;
  }

  const top = props.isContextMenu && !isFixed.value ? value.clientY - window.scrollY : value.clientY;
  const left = value.clientX;
  const boundingRect = {
    width: 0,
    height: 0,
    y: top,
    x: left,
    top,
    left,
    bottom: top,
    right: left
  };

  return {
    getBoundingClientRect: () => boundingRect
  };
}

/**
 * Calculate max width floating
 */
function calcMaxWidth() {
  const maxContent = 'max-content';
  const currentWidth = props.width ? props.width : maxContent;
  const hasParentWidth = currentWidth === 'parent-width';

  if (
    currentWidth === '100%' ||
    currentWidth === maxContent ||
    (hasParentWidth && !currentTarget.value) ||
    (hasParentWidth && props.isContextMenu)
  ) {
    return currentWidth === maxContent || hasParentWidth ? maxContent : '100%';
  }

  if (hasParentWidth) {
    const width = currentTarget.value?.getBoundingClientRect()?.width;
    return width ? toPx(width) : maxContent;
  }

  const isMaxWindow = currentWidth > window.innerWidth;
  const calcWidth = isMaxWindow ? window.innerWidth : currentWidth;

  return `calc(${toPx(calcWidth)} - ${toPx(isMaxWindow ? 36 : 0)})`;
}

/**
 * Setup arrow middleware
 */
function setupArrow() {
  const middleware = arrow(() => ({
    element: arrowRef.value
  }));
  return isShowArrow.value ? [middleware] : [];
}

/**
 * Update position floating menu
 */
async function update() {
  if (!currentTarget.value) {
    return;
  }

  const flipMiddleware = props.flip ? [flip(props.flip)] : [];
  const middleware = [offset(props.offset), ...flipMiddleware, shift(props.shift), ...setupArrow()];
  const options: Partial<ComputePositionConfig> = {
    strategy: isFixed.value ? 'fixed' : 'absolute',
    placement: props.placement,
    middleware
  };

  maxWidth.value = calcMaxWidth();
  await nextTick();
  const { x, y, middlewareData, placement } = await computePosition(currentTarget.value, floatingRef.value, options);

  currentPlacement.value = placement;
  floatingAxis.value.x = x;
  floatingAxis.value.y = y;

  if (!middlewareData.arrow) {
    return;
  }

  const { x: arrowX, y: arrowY } = middlewareData.arrow;
  arrowAxis.value.x = arrowX ?? 0;
  arrowAxis.value.y = arrowY ?? 0;
}

/**
 * Open floating menu
 * @param reference - Reference value
 * @param keepOpenOnTarget - Keep open menu
 */
async function open(reference: MouseEvent | HTMLElement, keepOpenOnTarget: boolean = true) {
  currentTarget.value = getReference(reference);
  await nextTick();

  if (!currentTarget.value || isOpen.value) {
    if ((cleanup.value && !keepOpenOnTarget) || (cleanup.value && props.isContextMenu)) {
      cleanup.value();
      await nextTick();
    }

    if (!currentTarget.value || !props.isContextMenu) {
      isOpen.value = !currentTarget.value ? false : keepOpenOnTarget;
      return;
    }

    await close();
    await nextTick();
  }

  isOpen.value = true;
  await nextTick();
  cleanup.value = autoUpdate(currentTarget.value, floatingRef.value, update, {
    ancestorScroll: false
  });
}

/**
 * Close floating menu
 */
async function close() {
  if (typeof cleanup.value === 'function') {
    cleanup.value();
    await nextTick();
  }

  isOpen.value = false;
}

function checkMounted() {
  if (!props.showOnMounted || (props.showOnMounted && !props.target)) {
    return;
  }

  const target = typeof props.target === 'string' ? document.querySelector(props.target) : props.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  open(target);
}

onClickOutside(floatingRef, (event) => {
  if (props.closeOutside && isOpen.value && event.target !== currentTarget.value) {
    close();
  }
});

provide('close', close);
defineExpose({ isOpen, open, close });
onMounted(checkMounted);
onBeforeUnmount(close);
</script>
