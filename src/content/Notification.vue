<template>
  <div class="notification" :class="{ visible, collapsible }">
    <slot />
    <div @click="close" class="notification__close_icon"><slot name="close" /></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const collapsible = ref(false)
const visible = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('notification__rooms_closed_2025__closed')
  visible.value = stored !== 'true'
  collapsible.value = true
})

function close() {
  visible.value = false
  localStorage.setItem('notification__rooms_closed_2025__closed', 'true')
}
</script>

<style lang="scss">
@use '../styles/text-styles';
@use '../styles/charter';

.notification {
  position: relative;
  padding: 24px 64px;
  @include text-styles.paragraphMediumRegular;
  background-color: charter.$primary600;
  color: charter.$neutrals50;
  display: none;

  a {
    color: charter.$neutrals50;
    text-decoration: underline;
  }

  &.visible {
    display: block;
  }

  &.collapsible .notification__close_icon {
    visibility: visible;
  }

  .notification__close_icon {
    visibility: hidden;
    position: absolute;
    right: 32px;
    font-size: 32px;
    top: 50%;
    margin-top: -16px;
    cursor: pointer;
  }
}
</style>
