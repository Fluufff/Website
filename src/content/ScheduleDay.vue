<template>
  <div class="schedule__day" :class="{ jsEnabled }">
    <h2 v-if="!jsEnabled">{{ dayInfo.name }}, {{ dayInfo.short }}</h2>
    <div class="schedule__day__open_locations">
      <div
        v-for="loc in locationsOfTheDay"
        class="schedule__day__open_location"
        :class="{ closed: loc.times.length === 0 }"
      >
        <IconPin class="pin" />
        <h3>{{ loc.name }}</h3>
        <IconClock />
        <div class="schedule__day__open_location__times">
          <span class="closed" v-if="loc.times.length === 0">Closed</span>
          <span v-else v-for="time in loc.times">{{ displayTime(time) }}</span>
        </div>
      </div>
    </div>
    <div class="schedule__day__events">
      <ScheduleEvent
        v-for="event in eventsOfTheDay"
        :event="event"
        :key="event.title"
        :tags="tags"
        :locations="locations"
        :days="days"
        :js-enabled="jsEnabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DayInfo, EventInfo, OpenLocation, OpenTime, TagInfo } from './Schedule.vue'
import IconPin from '~icons/brix/pin'
import IconClock from '~icons/brix/clock'
import { computed } from 'vue'
import ScheduleEvent from './ScheduleEvent.vue'

const props = defineProps<{
  day: number
  days: DayInfo[]
  tags: TagInfo[]
  events: EventInfo[]
  locations: string[]
  openLocations: OpenLocation[]
  jsEnabled: boolean
}>()

const dayInfo = computed(() => props.days[props.day]!)
const locationsOfTheDay = computed<OpenLocation[]>(() =>
  props.openLocations.map((l) => ({
    name: l.name,
    times: l.times.filter((t) => t[0] === props.day)
  }))
)

const eventsOfTheDay = computed(() => props.events.filter((e) => e.time[0] === props.day))

function displayTime(time: OpenTime): string {
  return `${pad(time[1])}:${pad(time[2])} - ${pad(time[3])}:${pad(time[4])}`
}

function pad(num: number): string {
  return num.toString().padStart(2, '0')
}
</script>

<style lang="scss">
@use '../styles/charter';
@use '../styles/text-styles';

.schedule__day {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: charter.$primary700;
  @include text-styles.display2Regular;

  &__open_locations {
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (min-width: 750px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  h2 {
    border-radius: 3px;
    padding: 12px 10px;
    background: charter.$secondary700;
    color: charter.$neutrals50;
    @include text-styles.display3SemiBold;
    text-align: center;
    align-self: center;
    line-height: 12px;
  }

  svg {
    height: 20px;
    width: 20px;
    flex-shrink: 0;
  }

  .schedule__day__open_location {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 8px;
    border: solid 1px charter.$neutrals400;
    padding: 24px;
    gap: 8px;
    box-shadow: 0 1px 4px 0 rgba(25, 33, 61, 0.08);

    &.closed {
      color: charter.$neutrals400;
    }

    @media (max-width: 600px) {
      padding: 16px;
    }

    &__times {
      display: flex;
      flex-direction: column;
      margin-right: auto;
    }

    svg.pin {
      order: 2;
    }

    h3 {
      display: flex;
      @include text-styles.display2Regular;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      order: 3;
      text-align: right;
    }
  }

  &__events {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
