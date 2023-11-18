import type { InlineOptions, Placement, Strategy, OffsetOptions, ShiftOptions } from '@floating-ui/dom';
import type { Component } from 'vue';

export type PopoverPlacement = Placement;

export type PopoverStrategy = Strategy;

export type PopoverOffset = OffsetOptions;

export type PopoverShift = ShiftOptions;

export type PopoverInline = InlineOptions;

export type PopoverTransition = {
  enterActiveClass: string;
  enterFromClass: string;
  enterToClass: string;
  leaveActiveClass: string;
  leaveFromClass: string;
  leaveToClass: string;
};

export type Popover = {
  strategy?: PopoverStrategy;
  placement?: PopoverPlacement;
  displayDirective?: 'if' | 'show';
  isContextMenu?: boolean;
  closeOutside?: boolean;
  flip?: boolean;
  shift?: PopoverShift;
  offset?: PopoverOffset;
  inline?: PopoverInline;
  transition?: string | PopoverTransition;
  contentClass?: string | string[];
  width?: number | '100%' | 'max-content';
  zIndex?: number;
  showArrow?: boolean;
  arrowClass?: string | string[];
  arrowSize?: number;
};

export type PopoverProgrammatic = Popover & {
  content: string | Component;
  keepOpenOnTarget?: boolean;
};
