<template>
  <div class="schedule" id="schedule">
    <div v-if="jsEnabled" class="schedule__nav" ref="scheduleNav">
      <button @click="scrollToLeft()"><IconChevronLeft /></button>
      <ul>
        <li v-for="(_, i) in days" :key="i" :class="{ active: i === currentDay }" @click="switchToDay(i)">
          <span>{{ days[i]!.name }},</span> {{ days[i]!.short }}
        </li>
      </ul>
      <button @click="scrollToRight()"><IconChevronRight /></button>
    </div>
    <div v-if="jsEnabled" class="schedule__container">
      <Transition :name="switchingRight ? 'slide-right' : 'slide-left'">
        <ScheduleDay
          :key="currentRenderIndex"
          :day="currentDay"
          :days="days"
          :open-locations="openLocations"
          :locations="locations"
          :tags="tags"
          :events="events"
          :js-enabled="jsEnabled"
        />
      </Transition>
    </div>
    <ScheduleDay
      v-else
      v-for="(_, i) in days"
      :key="i"
      :day="i"
      :days="days"
      :open-locations="openLocations"
      :locations="locations"
      :tags="tags"
      :events="events"
      :js-enabled="jsEnabled"
    />
  </div>
</template>

<script setup lang="ts">
import ScheduleDay from './ScheduleDay.vue'
import IconChevronLeft from '~icons/brix/chevron-left'
import IconChevronRight from '~icons/brix/chevron-right'
import { useMounted } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

export interface DayInfo {
  name: string
  short: string
  day: string
}
export interface TagInfo {
  name: string
  emoji: string
}
export interface EventInfo {
  time: OpenTime
  tags: number[]
  location: number | null
  host: string | null
  title: string
  description: string
}
export type OpenTime = [number, number, number, number, number]
export interface OpenLocation {
  name: string
  times: OpenTime[]
}

defineProps<{
  days: DayInfo[]
  tags: TagInfo[]
  events: EventInfo[]
  locations: string[]
  openLocations: OpenLocation[]
}>()

const scheduleNav = useTemplateRef<HTMLUListElement>('scheduleNav')

const currentDay = ref(0)
const currentRenderIndex = ref(0)
const switchingRight = ref(true)
const jsEnabled = useMounted()

function switchToDay(day: number) {
  if (day === currentDay.value) return

  switchingRight.value = day > currentDay.value
  currentRenderIndex.value = currentRenderIndex.value + 1
  currentDay.value = day
  document.getElementById('schedule')?.scrollIntoView()
}

const scrollToLeft = () => scheduleNav.value?.scrollTo({ left: 0, behavior: 'smooth' })
const scrollToRight = () => scheduleNav.value?.scrollTo({ left: 1000, behavior: 'smooth' })
</script>

<style lang="scss">
@use '../styles/charter';
@use '../styles/text-styles';

.schedule {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-self: stretch;
  position: relative;

  &__nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 10;
    background: charter.$neutrals300;
    margin: -16px !important;
    padding: 16px;
    scroll-behavior: smooth;

    ul {
      display: flex;
      position: relative;
      gap: 16px;
      flex-direction: row;
      list-style: none;
      margin: 0 !important;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    @media (max-width: 450px) {
      padding: 8px 0;
      gap: 8px;
      overflow-x: auto;

      ul {
        justify-content: flex-start;
      }

      button {
        display: flex !important;
      }
    }

    button {
      display: none;
      position: sticky;
      align-items: center;
      justify-content: center;
      border: 0;
      font-size: 32px;
      cursor: pointer;
      top: 0;
      z-index: 10;
      background: 0;

      svg {
        height: 40px;
        background: charter.$neutrals300;
        color: charter.$secondary500;
      }

      &:after {
        content: '';
        display: block;
        width: 8px;
        height: 40px;
        position: absolute;
      }

      &:first-child {
        left: 0;

        &:after {
          left: 100%;
          background: linear-gradient(to right, charter.$neutrals300, transparent);
        }
      }

      &:last-child {
        right: 0;

        &:after {
          right: 100%;
          background: linear-gradient(to left, charter.$neutrals300, transparent);
        }
      }
    }

    li {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      padding: 12px 10px;
      background: charter.$secondary500;
      color: charter.$neutrals50;
      @include text-styles.display3SemiBold;
      text-align: center;
      align-self: center;
      line-height: 12px;
      cursor: pointer;
      transition: background 0.3s ease-out;
      gap: 8px;
      white-space: nowrap;
      flex-shrink: 1;

      @media (max-width: 650px) {
        span {
          display: none;
        }
      }

      &.active {
        background: charter.$secondary700;
      }
    }
  }

  .schedule__container {
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
      background: linear-gradient(to right, charter.$neutrals300, transparent);
    }

    &:after {
      right: 0;
      background: linear-gradient(to left, charter.$neutrals300, transparent);
    }

    @media (max-width: 600px) {
      margin: 0 -16px;
      padding: 0 16px;
      &:before,
      &:after {
        width: 16px !important;
      }
    }
  }

  $slideAmount: 300px;
  .slide-left,
  .slide-right {
    &-enter-active {
      transition:
        transform 0.5s ease-out,
        opacity 0.5s ease-in;
      background-color: charter.$neutrals300;
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
