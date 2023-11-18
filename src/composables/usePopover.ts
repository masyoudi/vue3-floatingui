import { createVNode, getCurrentInstance, ref, nextTick, h, render, type VNode } from 'vue';
import MenuPopover from '../components/MenuPopover.vue';
import type { PopoverProgrammatic } from '../types/popover';

import { omit } from '../utils';
import { tryOnBeforeUnmount } from '@vueuse/core';

// Programmatic popover
export function usePopover() {
  const vnode = ref<VNode>();
  const container = ref<HTMLDivElement>();
  const instance = getCurrentInstance();

  const doOpen = (target: MouseEvent | HTMLElement, options: PopoverProgrammatic) => {
    const funcOpen = vnode.value?.component?.exposed?.open;

    if (typeof funcOpen === 'function') {
      funcOpen(target, options.keepOpenOnTarget ?? true);
    }
  };

  /**
   * Open popover
   * @param target - Target element
   * @param options - PopoverProgrammatic options
   */
  const open = (target: MouseEvent | HTMLElement, options: PopoverProgrammatic) => {
    if (vnode.value) {
      if (!vnode.value.component?.exposed?.isOpen?.value) {
        doOpen(target, options);
      }

      return;
    }

    container.value = document.createElement('div');
    document.body.appendChild(container.value);

    const config = omit(options, ['content', 'toggle']);
    vnode.value = createVNode(MenuPopover, config, {
      content: () => (typeof options.content === 'string' ? h('p', options.content) : h(options.content))
    });

    if (instance) {
      vnode.value.appContext = instance.appContext;
    }

    render(vnode.value, container.value);

    if (typeof doOpen === 'function') {
      nextTick(() => doOpen(target, options));
    }
  };

  // Close popover
  const close = () => {
    const doClose = vnode.value?.component?.exposed?.close;
    if (typeof doClose === 'function') {
      doClose();
    }
  };

  tryOnBeforeUnmount(() => {
    close();

    if (container.value) {
      render(null, container.value);
      container.value?.remove();
    }
  });

  return {
    open,
    close
  };
}
