import type { Loader, LoaderContext } from 'astro/loaders'
import { z } from 'astro:content'
import type { Strapi } from './strapi.ts'

import childProcess from 'node:child_process'
const branch = childProcess.execSync('git branch --show-current').toString().trim()

export function scheduleOpenLocationLoader(strapi: Strapi): Loader {
  return {
    name: 'schedule-open-locations-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      const items = await strapi.fetchItems('schedule-open-locations', { populate: 'opening_times' })

      for (const item of items) {
        const data = await ctx.parseData({
          id: item.documentId,
          data: { ...item }
        })

        ctx.store.set({ id: item.documentId, data })
      }
    },
    schema: z.object({
      name: z.string(),
      opening_times: z.array(
        z.object({
          day: z.string(),
          start_time: z.string(),
          end_time: z.string()
        })
      )
    })
  }
}

export function scheduleTagLoader(strapi: Strapi): Loader {
  return {
    name: 'schedule-tag-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      const items = await strapi.fetchItems('schedule-tags')

      for (const item of items) {
        const data = await ctx.parseData({
          id: item.id.toString(),
          data: { ...item }
        })

        ctx.store.set({ id: item.id.toString(), data })
      }
    },
    schema: z.object({
      id: z.number(),
      name: z.string(),
      icon: z.string().nullish(),
      color: z.string().nullish(),
      description: z.string()
    })
  }
}

export function scheduleLocationLoader(strapi: Strapi): Loader {
  return {
    name: 'schedule-location-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      const items = await strapi.fetchItems('schedule-locations')

      for (const item of items) {
        const data = await ctx.parseData({
          id: item.id.toString(),
          data: { ...item }
        })

        ctx.store.set({ id: item.id.toString(), data })
      }
    },
    schema: z.object({
      id: z.number(),
      name: z.string()
    })
  }
}

export function scheduleEventLoader(strapi: Strapi): Loader {
  return {
    name: 'schedule-event-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      const items = await strapi.fetchItems('schedule-events', {
        populate: { schedule_location: { fields: ['id'] }, schedule_tags: { fields: ['id'] } },
        pagination: { pageSize: 50 }
      })

      for (const item of items) {
        if (branch == 'main' && item['hidden_on_main_branch']) continue

        const data = await ctx.parseData({
          id: item.id.toString(),
          data: { ...item }
        })

        ctx.store.set({ id: item.id.toString(), data, rendered: await ctx.renderMarkdown(data.description) })
      }
    },
    schema: z.object({
      title: z.string(),
      day: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      description: z.string(),
      host_name: z.string().nullable(),
      schedule_location: z.object({ id: z.number() }).nullable(),
      schedule_tags: z.array(z.object({ id: z.number() }))
    })
  }
}

export function eventLabelsExplainedLoader(strapi: Strapi): Loader {
  return {
    name: 'event-labels-explained-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      let items = await strapi.fetchItems('event-labels-explained', { populate: 'schedule_tags' })
      items = [items]

      for (const item of items) {
        const data = await ctx.parseData({
          id: item.id.toString(),
          data: { ...item }
        })

        ctx.store.set({ id: item.id.toString(), data })
      }
    },
    schema: z.object({
      id: z.number(),
      description: z.string(),
      schedule_tags: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          icon: z.string().nullish(),
          color: z.string().nullish()
        })
      )
    })
  }
}
