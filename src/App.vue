<template>
  <div class="relative w-full max-w-7xl mx-auto px-6 py-20">
    <div class="relative mb-10">
      <button class="inline-flex justify-center items-center bg-teal-500 text-white rounded-lg px-4 py-2" @click="openTour">
        Open Tour
      </button>
    </div>
    <div class="relative mb-10">
      <p>
        Lorem <span v-tooltip="'Inline tooltip'" class="font-semibold">Inline</span> dolor sit amet consectetur adipisicing elit. Quis expedita at modi
        quidem! Beatae, voluptas. Rem, laborum quidem. Aliquam assumenda eos eligendi. Assumenda inventore sint repellat, a esse
        temporibus repudiandae.
      </p>
    </div>
    <MenuPopover
      strategy="fixed"
      :shift="{ padding: 12 }"
      :offset="12"
      class="bg-orange-500 rounded-lg shadow-lg p-4"
      arrow-class="bg-orange-500"
    >
      <template #default="{ open }">
        <button
          class="fixed inline-flex justify-center items-center bg-amber-600 text-white rounded-lg px-4 py-2 top-3 left-4"
          @click="($event) => open($event, false)"
        >
          Open Popover
        </button>
      </template>
      <template #content>
        <p class="text-white">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam, saepe quod explicabo sed in minus corporis deleniti adipisci
          expedita ut quasi ab nisi eveniet, reprehenderit possimus dolore velit fugit nostrum!
        </p>
      </template>
    </MenuPopover>

    <MenuPopover strategy="fixed" :width="1000" is-context-menu :show-arrow="false">
      <template #default="{ open }">
        <div
          class="fixed bottom-10 left-8 md:left-[50%] lg:left-[80%] right-5 border select-none bg-white rounded-xl p-4 mb-8 z-10 z-10"
          @contextmenu.prevent="open"
        >
          <h2 class="text-xl font-semibold mb-3">Try to right click on the bordered area</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, iusto aliquam enim atque praesentium odit corporis
            deserunt tempora facere, autem quas libero nisi quod. Nostrum ad deleniti debitis fugiat repellat!
          </p>
        </div>
      </template>
      <template #content="{ close }">
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam, saepe quod explicabo sed in minus corporis deleniti adipisci
          expedita ut quasi ab nisi eveniet, reprehenderit possimus dolore velit fugit nostrum!
        </p>
        <div class="flex justify-end">
          <button class="inline-flex bg-red-500 text-white text-sm rounded-md py-1 px-5" @click="close">Close</button>
        </div>
      </template>
    </MenuPopover>

    <MenuPopover is-context-menu :show-arrow="false">
      <template #default="{ open }">
        <div class="border select-none bg-white rounded-lg p-4 mb-8 z-10" @contextmenu.prevent="open">
          <h2 class="text-xl font-semibold mb-3">Try to right click on the bordered area</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, iusto aliquam enim atque praesentium odit corporis
            deserunt tempora facere, autem quas libero nisi quod. Nostrum ad deleniti debitis fugiat repellat!
          </p>
        </div>
      </template>
      <template #content="{ close }">
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam, saepe quod explicabo sed in minus corporis deleniti adipisci
          expedita ut quasi ab nisi eveniet, reprehenderit possimus dolore velit fugit nostrum!
        </p>
        <div class="flex justify-end">
          <button class="inline-flex bg-red-500 text-white text-sm rounded-md py-1 px-5" @click="close">Close</button>
        </div>
      </template>
    </MenuPopover>

    <div v-for="i in 100" :key="i">
      <p
        class="mb-4"
        :class="[{ 'fixed bottom-4 left-5 w-[300px]': i === 1 }, { 'border border-slate-300 rounded-lg p-3': i === 2 }]"
        :data-tour="i"
      >
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolores ratione dolorem ipsam obcaecati dolor, voluptatum ut rem
        porro nisi harum animi aliquam quasi consectetur doloribus blanditiis sapiente saepe maiores provident!
      </p>
    </div>

    <div class="flex space-x-3 mb-10">
      <button
        class="inline-flex justify-center items-center bg-slate-500 text-white rounded-lg px-4 py-2"
        @click="openPopoverProgrammatically"
      >
        Open Programmatically
      </button>
      <button class="inline-flex justify-center items-center bg-red-500 text-white rounded-lg px-4 py-2" @click="popover.close">
        Close
      </button>
    </div>
    <div class="flex space-x-3">
      <button
        class="inline-flex justify-center items-center bg-slate-500 text-white rounded-lg px-4 py-2"
        v-tooltip="'You can see this content'"
      >
        Hover Tooltip
      </button>

      <button
        class="inline-flex justify-center items-center bg-slate-500 text-white rounded-lg px-4 py-2"
        v-tooltip="{
          content: 'Text content',
          contentClass: 'bg-emerald-500 text-white px-2 py-0.5 text-sm rounded-md',
          arrowClass: 'bg-emerald-500',
          always: true
        }"
      >
        Always Open
      </button>
    </div>
    <MenuHighlight ref="tour"></MenuHighlight>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MenuHighlight from './components/MenuHighlight.vue';
import MenuPopover from './components/MenuPopover.vue';
import PopoverContent from './components/PopoverContent.vue';
import { usePopover } from './composables/usePopover';
import { vTooltip } from './directives/v-tooltip';

const popover = usePopover();
const tour = ref();

function openPopoverProgrammatically(event: MouseEvent) {
  popover.open(event, {
    offset: 14,
    content: PopoverContent,
    contentClass: 'bg-slate-200 rounded-lg p-4',
    displayDirective: 'show',
    closeOutside: false
  });
}

function openTour() {
  tour.value?.open();
}
</script>
