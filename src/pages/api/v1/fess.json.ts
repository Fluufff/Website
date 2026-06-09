// https://github.com/FurryApp/event-schedule-schema

// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { APIRoute } from 'astro'
import { type CollectionEntry, getCollection } from 'astro:content'

const raw_tags = await getCollection('scheduleTags')
const raw_locations = await getCollection('scheduleLocations')
const raw_events = await getCollection('scheduleEvents')

function get_host_id_from_host_name(host_name: string) {
  return host_name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

const raw_hosts: CollectionEntry<'scheduleHosts'> = []
raw_events.map((event: any) => {
  const host_name: string = event.data.host_name
  if (!host_name) return

  const host_id = get_host_id_from_host_name(host_name)
  if (raw_hosts.some((raw_host: any) => raw_host.id == host_id)) return

  raw_hosts.push({
    id: host_id,
    data: {
      name: host_name
    }
  })
})

function en_US(string: string) {
  return {
    'en-US': string
  }
}

function id(number: number) {
  return `${number}`
}

export const GET: APIRoute = () => {
  const data = {
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    event: {
      id: 'fluufff',
      displayName: en_US('Flüüfff'),
      startTime: '2026-11-11T08:00:00.000',
      endTime: '2026-11-15T23:59:59.999', // todo: find out actual time
      timezone: 'Europe/Brussels' // todo: timezone is defined here, does that mean omitting the Z and/or skipping +1/2?
    },
    membershipLevels: [],
    tracks: [],
    sessionTypes: [],
    labels: raw_tags.map((raw_tag: any) => {
      return {
        id: id(raw_tag.id),
        displayName: en_US(raw_tag.data.name),
        description: en_US(raw_tag.data.description)
      }
    }),
    venues: [
      {
        id: 'mercure',
        displayName: en_US('Mercure Antwerp City South Hotel')
      }
    ],
    rooms: raw_locations.map((raw_location: any) => {
      return {
        id: id(raw_location.id),
        displayName: en_US(raw_location.data.name),
        venueId: 'mercure'
      }
    }),
    hosts: raw_hosts.map((raw_host: any) => {
      return {
        id: id(raw_host.id),
        displayName: raw_host.data.name
      }
    }),
    sessions: raw_events.map((raw_event: any) => {
      return {
        id: id(raw_event.id),
        displayName: en_US(raw_event.data.title),
        description: en_US(raw_event.data.description),
        timeSlots: [{
          startTime: `${raw_event.data.day}T${raw_event.data.start_time}`,
          endTime: `${raw_event.data.day}T${raw_event.data.end_time}`,
          roomIds: raw_event.data.schedule_location ? [id(raw_event.data.schedule_location.id)] : [],
          hostIds: raw_event.data.host_name ? [get_host_id_from_host_name(raw_event.data.host_name)] : [],
          labelIds: raw_event.data.schedule_tags.map((schedule_tag: any) => id(schedule_tag.id))
        }]
      }
    })
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json'
    }
  })
}
