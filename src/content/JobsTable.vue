<template>
  <div class="jobs-table">
    <div class="jobs-table__toolbar" :class="{ jsEnabled }">
      <div class="search-input">
        <InputText placeholder="Search roles..." v-model.trim="search" />
        <slot name="searchIcon" />
      </div>
      <MultiSelect
        v-model="selectedDepartments"
        :options="departments"
        placeholder="All departments"
        :show-toggle-all="false"
      />
      <MultiSelect
        v-model="selectedWorkmodels"
        :options="['Pre-Con', 'On-site', 'Hybrid']"
        placeholder="All work models"
        :show-toggle-all="false"
      />
      <span>{{ searchResults.length }} results</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Role</th>
          <th>Department</th>
          <th>Work Model</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in searchResults" :key="role.slug">
          <td>{{ role.title }}</td>
          <td>{{ role.department_name }}</td>
          <td>{{ role.work_model }}</td>
          <td>
            <div class="jobs-table__status-container">
              <span :class="{ open: role.open_for_applications }">{{
                role.open_for_applications ? 'Open for applications' : 'Closed for applications'
              }}</span>
              <a v-if="role.open_for_applications" :href="'/staff-volunteering/' + role.slug"><ChevronRightIcon /></a>
            </div>
          </td>
        </tr>
        <tr v-if="searchResults.length === 0">
          <td colspan="4" class="empty">No results</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { InputText, MultiSelect } from 'primevue'
import ChevronRightIcon from '@primevue/icons/chevronright'
import { useMounted } from '@vueuse/core'

import { ref, computed } from 'vue'
import type { CollectionEntry } from 'astro:content'

export type StaffRole = Pick<
  CollectionEntry<'staffRoles'>['data'],
  'slug' | 'title' | 'department_name' | 'work_model' | 'open_for_applications'
>
const props = defineProps<{ staffRoles: StaffRole[] }>()
const staffRoles = props.staffRoles

const departments = [...new Set(staffRoles.map((r) => r.department_name))]

const selectedWorkmodels = ref<string[]>([])
const selectedDepartments = ref<string[]>([])
const search = ref('')

const searchResults = computed(() => {
  let results = staffRoles
  if (search.value) {
    const searchItems = search.value.toLowerCase().split(' ')
    results = results.filter((r) =>
      searchItems.every(
        (s) =>
          r.department_name.toLowerCase().includes(s) ||
          r.title.toLowerCase().includes(s) ||
          r.work_model.toLowerCase().includes(s)
      )
    )
  }

  if (selectedWorkmodels.value.length > 0) {
    results = results.filter((r) => selectedWorkmodels.value.includes(r.work_model))
  }
  if (selectedDepartments.value.length > 0) {
    results = results.filter((r) => selectedDepartments.value.includes(r.department_name))
  }
  return results
})

const jsEnabled = useMounted()
</script>

<style lang="scss">
@use '../styles/charter';
@use '../styles/text-styles';

.jobs-table {
  display: flex;
  align-items: stretch;
  align-self: center;
  flex-direction: column;
  width: 100%;

  margin-top: 64px;

  &__toolbar {
    display: flex;
    flex-direction: row;
    gap: 40px;
    color: charter.$neutrals600;
    visibility: hidden;
    height: 60px;
    opacity: 0;
    transition: opacity 0.5s ease-out;

    &.jsEnabled {
      visibility: visible;
      opacity: 1;
    }

    > * {
      flex: 1;
    }

    > span {
      align-self: center;
      text-align: right;
      max-width: 100px;
    }

    [data-pc-name='multiselect'] {
      display: flex;
      cursor: pointer;
      align-items: center;
      border-bottom: solid 1px charter.$secondary400;
      user-select: none;

      [data-pc-section='labelcontainer'] {
        padding: 16px 0;
      }

      [data-pc-section='dropdown'] {
        margin-left: auto;
      }
    }

    .search-input {
      position: relative;
      display: flex;
      flex-direction: row;
      > input {
        flex: 1;
        background: 0;
        border: 0;
        @include text-styles.paragraphMediumRegular;
        padding: 16px 32px 16px 0;
        outline: 0;

        border-bottom: solid 1px charter.$secondary400;
      }

      svg {
        font-size: 20px;
        position: absolute;
        right: 0;
        top: 50%;
        margin-top: -10px;
      }
    }
  }

  > table {
    margin-top: 32px;
    border-radius: 8px;
    overflow: hidden;
    border: solid 1px charter.$secondary500;
    border-spacing: 0;
    table-layout: fixed;

    thead {
      background: charter.$secondary500;

      th {
        padding: 24px 22px;
        text-align: left;
        color: charter.$neutrals50;

        &:nth-child(2) {
          width: 250px;
        }

        &:last-child {
          width: 200px;
        }

        &:nth-child(3) {
          width: 150px;
        }
      }
    }

    tbody {
      tr {
        position: relative;

        background: charter.$neutrals50;
        transition: 0.2s ease-out background-color;

        &:hover {
          background: charter.$secondary50;
        }

        & + tr td {
          border-top: solid 1px charter.$secondary500;
        }

        a::after {
          content: '';
          position: absolute;
          inset: 0;
        }
      }
      td {
        padding: 24px 22px;
        text-align: left;

        &:first-child {
          @include text-styles.display3SemiBold;
        }

        &.empty {
          text-align: center;
          color: charter.$neutrals600;
          background: charter.$neutrals50;
        }
      }
    }
    .jobs-table__status-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      span {
        display: inline-block;
        text-align: center;
        margin-right: 10px;
        padding: 5px;
        width: 182px;
        border-radius: 3px;

        background: charter.$secondary100;
        @include text-styles.display2SemiBold;

        &.open {
          background: charter.$accent1-100;
        }
      }
    }
  }

  @media (max-width: 720px) {
    position: relative;
    margin-top: 24px;
    gap: 16px;

    &__toolbar {
      flex-direction: column;
      height: auto;
      gap: 10px;
      padding: 0 12px;

      [data-pc-name='multiselect'],
      span {
        display: none;
      }
    }

    > table {
      display: flex;
      flex-direction: column;
      margin-top: 0;
      border: 0;
      border-radius: 0;
      overflow: visible;
    }

    tbody {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    thead {
      display: none;
    }

    > table tbody tr {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      border: solid 1px charter.$neutrals400;
      border-radius: 8px;
      padding: 24px;

      /* Neutral/Shadow 02 */
      box-shadow: 0 1px 4px 0 rgba(25, 33, 61, 0.08);
    }

    > table tbody tr td:not(.empty) {
      padding: 0 12px 0 0;
      border: 0 !important;

      a {
        position: absolute;
        inset: 0;

        svg {
          position: absolute;
          top: 28px;
          right: 24px;
        }

        &:after {
          display: none;
        }
      }

      &:first-child {
        @include text-styles.heading4;
        margin-bottom: 24px;
      }

      &:nth-child(2) {
        @include text-styles.display2Regular;
        margin-bottom: 10px;
        &:before {
          content: 'Department: ';
        }
      }

      &:nth-child(3) {
        @include text-styles.display2Regular;
        margin-bottom: 24px;
        &:before {
          content: 'Workmodel: ';
        }
      }

      &:last-child {
        padding: 0;
      }

      .jobs-table__status-container {
        align-items: stretch;

        > span {
          flex: 1;
          margin: 0;
        }
      }
    }
  }
}

[data-pc-section='list'] {
  list-style: none;
  background: charter.$neutrals50;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.14),
    0 0 2px 0 rgba(0, 0, 0, 0.12);

  border-radius: 0 0 5px 5px;
  overflow: hidden;

  > li {
    display: flex;
    gap: 8px;
    padding: 8px 16px 8px 32px;
    cursor: pointer;
    user-select: none;

    transition: background-color ease-out 0.2s;

    @include text-styles.paragraphMediumRegular;

    &:hover {
      background-color: charter.$secondary50;
    }

    &[aria-selected='true'] {
      background-color: charter.$secondary100;
      color: charter.$secondary500;
    }

    [data-pc-name='pcoptioncheckbox'] {
      position: absolute;
      display: flex;
      align-items: center;
      left: 8px;

      input {
        display: none;
      }
    }
  }
}
</style>
