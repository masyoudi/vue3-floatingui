import { type Directive, type DirectiveBinding } from 'vue';
import { usePopover } from '../composables/usePopover';
import type { PopoverProgrammatic } from '../types/popover';

const setCondition = (func: any) => {
  if (typeof func === 'function') {
    return typeof func() === 'boolean' ? () => func : () => true;
  }

  return () => true;
};

const setupTooltip = (target: any, binding: DirectiveBinding) => {
  if (!(target instanceof HTMLElement) || !binding.value) {
    return;
  }

  const isContentString = typeof binding.value === 'string';
  const parsed = isContentString ? { content: binding.value } : binding.value;
  const isAlways = !isContentString ? !!binding.value.always : false;
  const canExecute = !isContentString ? setCondition(binding.value.condition) : () => true;
  const options: PopoverProgrammatic = {
    contentClass: 'bg-slate-900 text-sm text-white rounded-md px-2 py-[3px]',
    arrowClass: 'bg-slate-900',
    offset: 10,
    arrowSize: 10,
    width: 'max-content',
    ...parsed,
    ...(isAlways ? { closeOutside: false } : {})
  };

  const popover = usePopover();
  const open = () => (canExecute() ? popover.open(target, options) : () => {});
  if (isAlways) {
    open();
    return;
  }

  const events: Record<string, any> = {
    mouseenter: open,
    mouseleave: popover.close,
    blur: popover.close,
    focus: open
  };

  for (const name in events) {
    target.addEventListener(name, events[name]);
  }
};

export const vTooltip: Directive = {
  mounted: setupTooltip,
  updated: setupTooltip
};
