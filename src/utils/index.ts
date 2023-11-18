import type { App } from 'vue';

export const transitionPopover = {
  enterActiveClass: 'transition duration-150 ease-out',
  enterFromClass: 'transform scale-95 opacity-0',
  enterToClass: 'transform scale-100 opacity-100',
  leaveActiveClass: 'transition duration-75 ease-in',
  leaveFromClass: 'transform scale-100 opacity-100',
  leaveToClass: 'transform scale-95 opacity-0'
};

export let VueInstance: App;

/** set the global vue instance */
export const setVueInstance = (Vue: App): void => {
  VueInstance = Vue;
};

export function toPx(value: number | string, important: boolean = false) {
  return `${value}px ${important ? '!important' : ''}`.trim();
}

export function roundByDPR(value: number) {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

/**
 * Remove object value by keys
 * @param source - Source object
 * @param keys - keys to remove
 * @returns object
 */
export function omit(source: Record<string, any>, keys: string[]) {
  return Object.keys(source || {}).reduce((prev: Record<string, any>, key) => {
    if (keys.indexOf(key) === -1) {
      prev[key] = source[key];
    }

    return prev;
  }, {});
}
