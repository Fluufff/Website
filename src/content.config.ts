import { defineCollection } from 'astro:content'
import { rolesLoader } from './hr-roles-loader.ts'
import {
  scheduleOpenLocationLoader,
  scheduleTagLoader,
  scheduleLocationLoader,
  scheduleEventLoader,
  eventLabelsExplainedLoader
} from './schedule-loader.ts'
import {
  // faqEntryLoader,
  faqPageLoader,
  dedicatedFaqPageLoader
} from './faq-loader.ts'
import { loadStrapi } from './strapi.ts'

const strapi = loadStrapi()

export const collections = {
  staffRoles: defineCollection({ loader: rolesLoader(strapi) }),
  scheduleOpenLocations: defineCollection({ loader: scheduleOpenLocationLoader(strapi) }),
  scheduleLocations: defineCollection({ loader: scheduleLocationLoader(strapi) }),
  scheduleEvents: defineCollection({ loader: scheduleEventLoader(strapi) }),
  scheduleTags: defineCollection({ loader: scheduleTagLoader(strapi) }),
  // faqEntries: defineCollection({ loader: faqEntryLoader(strapi) }),
  faqPages: defineCollection({ loader: faqPageLoader(strapi) }),

  eventLabelsExplained: defineCollection({ loader: eventLabelsExplainedLoader(strapi) }),
  dedicatedFaqPage: defineCollection({ loader: dedicatedFaqPageLoader(strapi) })
}
