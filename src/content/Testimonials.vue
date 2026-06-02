<template>
  <div class="staff_testimonials content primary">
    <div class="staff_testimonials__header">
      <div class="staff_testimonials__title">
        <h2>Love for Flüüfff</h2>
        <p>Some kind words from our staff and volunteers. 💚</p>
      </div>
      <div class="staff_testimonials__buttons" :class="{ jsEnabled }" v-element-hover="updateButtonHovered">
        <button class="button" @click="switchTestimonial(-1)"><IconLeft /></button>
        <button class="button" @click="switchTestimonial(1)"><IconRight /></button>
      </div>
    </div>
    <div class="staff_testimonials__content">
      <Transition :name="switchingRight ? 'slide-right' : 'slide-left'">
        <div class="staff_testimonials__item" :key="currentRenderIndex">
          <div class="staff_testimonials__item_aside">
            <span class="staff_testimonials__item_name">{{ currentTestimonial.name }}</span>
            <span class="staff_testimonials__item_role">{{ currentTestimonial.role }}</span>
          </div>
          <p>“{{ currentTestimonial.testimony }}”</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn, useMounted } from '@vueuse/core'
import { vElementHover } from '@vueuse/components'
import testimonials from '../data/hr/testimonials.json'
import { computed, ref } from 'vue'
import IconLeft from '@primevue/icons/chevronleft'
import IconRight from '@primevue/icons/chevronright'

const jsEnabled = useMounted()
const currentRenderIndex = ref(0)
const currentTestimonialIndex = ref(0)
const currentTestimonial = computed(() => testimonials[currentTestimonialIndex.value]!)
const switchingRight = ref(true)

const autoScroller = useIntervalFn(() => switchTestimonial(1), 10_000)

function updateButtonHovered(hovered: boolean) {
  if (hovered) {
    autoScroller.pause()
  } else {
    autoScroller.resume()
  }
}

function switchTestimonial(direction: number) {
  switchingRight.value = direction > 0
  currentRenderIndex.value = currentRenderIndex.value + 1

  if (autoScroller.isActive.value) {
    autoScroller.pause()
    autoScroller.resume()
  }

  const newIndex = currentTestimonialIndex.value + direction
  if (newIndex < 0) {
    currentTestimonialIndex.value = testimonials.length - 1
  } else if (newIndex >= testimonials.length) {
    currentTestimonialIndex.value = 0
  } else {
    currentTestimonialIndex.value = newIndex
  }
}
</script>

<style lang="scss">
@use '../styles/charter';
@use '../styles/text-styles';

.staff_testimonials {
  align-items: center;
  gap: 64px;

  > * {
    width: 100%;
    max-width: 1100px;
  }

  &__header {
    display: flex;
    flex-direction: row;

    h2 {
      @include text-styles.heading2;
    }
  }

  &__title {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-right: auto;
  }

  &__buttons {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-self: flex-end;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.5s ease-out;

    &.jsEnabled {
      visibility: visible;
      opacity: 1;
    }
  }

  &__content {
    position: relative;
    //background: blue;
    margin: 0 -40px;
    padding: 0 40px;
    overflow: clip;

    &:before,
    &:after {
      content: '';
      position: absolute;
      height: 100%;
      width: 40px;
      top: 0;
      z-index: 5;
    }

    &:before {
      left: 0;
      background: linear-gradient(to right, charter.$primary-100, transparent);
    }

    &:after {
      right: 0;
      background: linear-gradient(to left, charter.$primary-100, transparent);
    }
  }

  &__item {
    display: flex;
    flex-direction: row;
    gap: 80px;

    opacity: 1;

    &_aside {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      gap: 16px;
    }

    &_name {
      @include text-styles.heading4;
    }

    &_role {
      @include text-styles.display3SemiBold;
      color: charter.$primary-700;
    }
  }

  $slideAmount: 100px;
  .slide-left,
  .slide-right {
    &-enter-active {
      transition:
        transform 0.5s ease-out,
        opacity 0.5s ease-in;
      background-color: charter.$primary-100;
      z-index: 2;
    }

    &-leave-active {
      position: absolute;
      inset: 0 40px;
      transition:
        transform 0.5s ease-out,
        opacity 0.4s ease-out;
      z-index: 1;
    }

    &-enter-from {
      opacity: 0;
      transform: translateX($slideAmount);
    }

    &-enter-to {
      opacity: 1;
    }

    &-leave-to {
      opacity: 0;
      transform: translateX(-$slideAmount);
    }
  }

  .slide-left {
    &-enter-from {
      transform: translateX(-$slideAmount);
    }

    &-leave-to {
      transform: translateX($slideAmount);
    }
  }
}
</style>
