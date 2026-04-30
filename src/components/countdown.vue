<template>
  <div class="registration_banner_countdown">
    <div>
      <span class="time">{{ padded(time.days) }}</span>
      <span class="label">Days</span>
    </div>
    :
    <div>
      <span class="time">{{ padded(time.hours) }}</span>
      <span class="label">Hours</span>
    </div>
    :
    <div>
      <span class="time">{{ padded(time.minutes) }}</span>
      <span class="label">Minutes</span>
    </div>
    :
    <div>
      <span class="time">{{ padded(time.seconds) }}</span>
      <span class="label">Seconds</span>
    </div>
  </div>
</template>

<style lang="scss">
@use '../styles/charter';

.registration_banner_countdown {
  display: flex;
  flex-direction: row;
  gap: 2px;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 2em;

    position: relative;

    .label {
      color: charter.$accent1-300;
      font-family: var(--font-inter), sans-serif;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      text-transform: uppercase;
      line-height: 12px;

      position: absolute;
      bottom: -12px;
    }
  }
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  targetDate: {
    type: String,
    required: true
  }
})

const time = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

const padded = (t: number) => {
  return String(t).padStart(2, '0')
}

let interval: NodeJS.Timeout
updateCountdown()

function updateCountdown() {
  const now = new Date().getTime()
  const target = new Date(props.targetDate).getTime()
  const diff = target - now

  if (diff <= 0) {
    time.value.days = time.value.hours = time.value.minutes = time.value.seconds = 0
    clearInterval(interval)
    return
  }

  time.value.days = Math.floor(diff / (1000 * 60 * 60 * 24))
  time.value.hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  time.value.minutes = Math.floor((diff / (1000 * 60)) % 60)
  time.value.seconds = Math.floor((diff / 1000) % 60)
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
