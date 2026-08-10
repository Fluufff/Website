import type { Loader, LoaderContext } from 'astro/loaders'
import { z } from 'astro:content'
import type { Strapi } from './strapi.ts'

export function regBookingLoader(strapi: Strapi): Loader {
  return {
    name: 'reg-booking-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      const items = await strapi.fetchItems('reg-bookings')

      for (const item of items) {
        const data = await ctx.parseData({
          id: item.id,
          data: { ...item }
        })

        ctx.store.set({ id: item.id, data })
      }
    },
    schema: z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      available: z.number()
    })
  }
}
