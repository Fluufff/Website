<template>
  <div class="schedule__day__event" :key="event.title">
    <div v-if="jsEnabled" class="schedule__day__event__deets">
      <div class="schedule__day__event__time"><IconClock /> {{ displayTime(event.time) }}</div>
      <div v-if="status" class="schedule__day__event__status" :class="[status]">{{ displayStatus(status) }}</div>
    </div>
    <div v-else class="schedule__day__event__time"><IconClock /> {{ displayTime(event.time) }}</div>

    <h3>{{ event.title }}</h3>
    <div v-if="event.host" class="schedule__day__event__deets">
      <div v-if="event.location !== null"><IconPin /> {{ displayLocation(event.location) }}</div>

      <div class="host" v-if="event.host"><IconUser /> {{ event.host }}</div>
    </div>
    <button v-if="jsEnabled" :class="{ toggled: descriptionToggled }" @click="descriptionToggled = !descriptionToggled">
      {{ descriptionToggled ? 'Hide' : 'Show' }} full event description <IconArrow />
    </button>
    <div v-if="event.description" class="schedule__day__event__description" :class="{ visible: descriptionToggled }">
      <div class="schedule__day__event__description__inner" v-html="event.description"></div>
    </div>
    <div class="schedule__day__event__tags" v-if="event.tags.length > 0">
      <a href="#event_labels" v-for="tag in event.tags">
        <span>{{ displayTagEmoji(tag) }}</span
        >{{ displayTag(tag) }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import IconPin from '~icons/brix/pin'
import IconClock from '~icons/brix/clock'
import IconArrow from '~icons/brix/arrow-down-1'
import IconUser from '~icons/brix/user'

import type { EventInfo, OpenTime, DayInfo, TagInfo } from './Schedule.vue'
import { DateTime } from 'luxon'
import { useIntervalFn } from '@vueuse/core'

const descriptionToggled = ref(false)

const props = defineProps<{
  event: EventInfo
  days: DayInfo[]
  tags: TagInfo[]
  locations: string[]
  jsEnabled: boolean
}>()

type Status = 'past' | 'ongoing' | 'comingup'
const parsedTimes = computed(() => parseTimes(props.event.time))

const currentTime = shallowRef(DateTime.now())
//const currentTime = shallowRef(DateTime.fromISO('2025-11-07T01:22'))

useIntervalFn(() => {
  currentTime.value = DateTime.now()
}, 42_000)

const status = computed((): Status | null => {
  const [startTime, endTime] = parsedTimes.value
  if (endTime < currentTime.value) return 'past'
  if (startTime < currentTime.value) return 'ongoing'
  if (!startTime.hasSame(currentTime.value, 'day')) return null
  return 'comingup'
})

const displayStatus = (s: Status) => {
  switch (s) {
    case 'comingup':
      return 'Coming up'
    case 'ongoing':
      return 'Happening now'
    case 'past':
      return 'Past'
  }
}

function displayTime(time: OpenTime): string {
  return `${pad(time[1])}:${pad(time[2])} - ${pad(time[3])}:${pad(time[4])}`
}

const displayLocation = (i: number) => props.locations[i]!
const displayTag = (i: number) => props.tags[i]!.name
const displayTagEmoji = (i: number) => props.tags[i]!.emoji

function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

function parseTimes(time: OpenTime): [DateTime, DateTime] {
  const day = DateTime.fromISO(props.days[time[0]!]!.day)
  const startDay = time[1] < 5 ? day.plus({ day: 1 }) : day
  const endDay = time[3] < 5 ? day.plus({ day: 1 }) : day

  return [startDay.set({ hour: time[1], minute: time[2] }), endDay.set({ hour: time[3], minute: time[4] })]
}
</script>

<style lang="scss">
@use '../styles/charter';
@use '../styles/text-styles';

.schedule__day__event {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 24px;
  border-radius: 8px;
  border: solid 1px charter.$primary200;
  background: charter.$neutrals50;
  box-shadow: 0 1px 4px 0 rgba(25, 33, 61, 0.08);

  h3 {
    @include text-styles.heading3;

    @media (max-width: 700px) {
      @include text-styles.heading4;
    }
  }

  &__time {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  &__status {
    display: flex;
    flex-direction: row;
    @include text-styles.display2Regular;
    border-radius: 20px;
    padding: 2px 8px;
    gap: 8px;

    &:before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 100%;
    }

    &.ongoing {
      background: charter.$primary100;
      color: charter.$accent1-700;

      &:before {
        background: charter.$accent1-600;
      }
    }

    &.comingup {
      background: charter.$secondary100;
      color: charter.$secondary700;

      &:before {
        background: charter.$secondary400;
      }
    }

    &.past {
      background: charter.$neutrals300;
      color: charter.$neutrals700;

      &:before {
        background: charter.$neutrals400;
      }
    }
  }

  &__deets {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px 32px;
    align-items: center;
    justify-content: space-between;

    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }
  }

  &__tags {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    border-top: solid 1px charter.$primary200;
    padding-top: 24px;

    a {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      border-radius: 3px;
      border: solid 1px charter.$primary200;
      background: charter.$primary100;
      gap: 4px;
      padding: 10px;
      text-decoration: none !important;

      @include text-styles.display2SemiBold;
      line-height: 10px;
    }
  }

  > button {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 8px;
    border: 0;
    background: 0;
    text-align: left;
    color: charter.$secondary500;
    margin-bottom: -32px;
    cursor: pointer;
    @include text-styles.display3Regular;

    svg {
      height: 16px;
      width: 16px;
      transition: transform 0.3s ease-out;
      transform: scale(1, 1);
    }

    &.toggled svg {
      transform: scale(1, -1);
    }
  }

  &__description {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: auto;
    overflow: hidden;

    &__inner {
      padding-top: 16px;
      overflow: hidden;
    }
  }
}

.jsEnabled .schedule__day__event {
  &__description {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    visibility: hidden;
    transition:
      grid-template-rows 0.3s ease-out,
      visibility 0.3s ease-out,
      opacity 0.3s ease-out;

    &.visible {
      grid-template-rows: 1fr;
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
