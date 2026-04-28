<template>
  <div id="registration_banner_countdown">
    <div>
      <span class="time">{{ String(days).padStart(2, '0') }}</span>
      <span class="label">Days</span>
    </div>
    :
    <div>
      <span class="time">{{ String(hours).padStart(2, '0') }}</span>
      <span class="label">Hours</span>
    </div>
    :
    <div>
      <span class="time">{{ String(minutes).padStart(2, '0') }}</span>
      <span class="label">Minutes</span>
    </div>
    :
    <div>
      <span class="time">{{ String(seconds).padStart(2, '0') }}</span>
      <span class="label">Seconds</span>
    </div>
  </div>
</template>

<style lang="scss">
div {
  position: relative;

  .label {
    position: absolute;
    bottom: -12px;
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

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

let interval: NodeJS.Timeout
updateCountdown()

function updateCountdown() {
  const now = new Date().getTime()
  const target = new Date(props.targetDate).getTime()
  const diff = target - now

  if (diff <= 0) {
    days.value = hours.value = minutes.value = seconds.value = 0
    clearInterval(interval)
    return
  }

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff / (1000 * 60 * 60)) % 24)
  minutes.value = Math.floor((diff / (1000 * 60)) % 60)
  seconds.value = Math.floor((diff / 1000) % 60)
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
