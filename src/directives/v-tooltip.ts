import { nextTick, type Directive, type DirectiveBinding } from 'vue';
import { usePopover } from '../composables/usePopover';
import type { PopoverProgrammatic } from '../types/popover';

const setupTooltip = async (el: any, binding: DirectiveBinding) => {
  if (!(el instanceof HTMLElement) || !binding.value) {
    return;
  }

  const isContentString = binding.value === 'string';
  const parsed = isContentString ? { content: binding.value } : binding.value;
  const isAlways = !isContentString ? !!binding.value.always : false;
  const options: PopoverProgrammatic = {
    contentClass: 'bg-white border text-sm rounded-md px-2 py-[3px]',
    offset: 12,
    arrowSize: 12,
    width: 'max-content',
    ...parsed,
    ...(isAlways ? { closeOutside: false } : {})
  };

  const popover = usePopover();
  const open = () => popover.open(el, options);
  const defaultEvents = {
    mouseenter: open,
    mouseleave: popover.close,
    blur: popover.close
  };
  const events: Record<string, any> = {
    ...(!isAlways ? defaultEvents : {}),
    focus: open
  };

  Object.keys(events).forEach((key) => el.addEventListener(key, events[key]));

  if (isAlways) {
    await nextTick();
    el.focus();
  }
};

export const vTooltip: Directive = {
  mounted: setupTooltip,
  updated: setupTooltip
};
