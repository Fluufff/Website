import type { Loader, LoaderContext } from 'astro/loaders'
import { z } from 'astro:content'
import type { Strapi } from './strapi.ts'

// export function faqEntryLoader(strapi: Strapi): Loader {
//   return {
//     name: 'faq-entry-loader',
//     async load(ctx: LoaderContext) {
//       ctx.store.clear()

//       const items = await strapi.fetchItems('faq-entries')

//       for (const item of items) {
//         const data = await ctx.parseData({
//           id: item.id,
//           data: { ...item }
//         })

//         ctx.store.set({ id: item.id, data })
//       }
//     },
//     schema: z.object({
//       id: z.string(),
//       question: z.string(),
//       answer: z.string()
//     })
//   }
// }

export function faqPageLoader(strapi: Strapi): Loader {
  return {
    name: 'faq-page-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      const items = await strapi.fetchItems('faq-pages', { populate: 'faq_entries' })

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
      slug: z.string(),
      name: z.string().nullish(),
      icon: z.string().nullish(),
      faq_entries: z.array(
        z.object({
          id: z.string(),
          question: z.string(),
          answer: z.string(),
          // updatedAt: z.string()
        })
      )
    })
  }
}

export function dedicatedFaqPageLoader(strapi: Strapi): Loader {
  return {
    name: 'dedicated-faq-page-loader',
    async load(ctx: LoaderContext) {
      ctx.store.clear()

      let items = await strapi.fetchItems('dedicated-faq-page', { populate: 'faq_pages.faq_entries'})
      items = [items]

      for (const item of items) {
        const data = await ctx.parseData({
          id: item.id,
          data: { ...item }
        })

        ctx.store.set({ id: item.id, data })
      }
    },
    schema: z.object({
      title: z.string(),
      description: z.string(),
      faq_pages: z.array(
        z.object({
          slug: z.string(),
          name: z.string().nullish(),
          icon: z.string().nullish(),
          faq_entries: z.array(
            z.object({
              updatedAt: z.string()
            })
          )
        })
      ),
      updatedAt: z.string()
    })
  }
}
