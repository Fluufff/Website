import { loadEnv } from 'vite'
import qs from 'qs'
import process from 'node:process'

export interface Strapi {
  warnings: string[][],
  // deno-lint-ignore no-explicit-any
  fetchItems(itemName: string, options?: object): Promise<any[]> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function loadStrapi(): Strapi {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development' || process.env.MODE === 'typecheck'

  const { STRAPI_URI, STRAPI_TOKEN } = loadEnv(env, process.cwd(), '')

  if (!STRAPI_URI || !STRAPI_TOKEN) {
    if (isDevelopment) {
      console.info(
        'Cannot connect to CMS due to missing STRAPI_URI or STRAPI_TOKEN environment variables. Using empty data for CMS instead. Some pages may look a bit empty.'
      )

      return dummyStrapi()
    }

    if (!isDevelopment) throw new Error('Missing STRAPI_URI or STRAPI_TOKEN environment variables')
  }

  const warnings: string[][] = []
  return {
    warnings,
    fetchItems: async (itemName: string, options?: object) => {
      try {
        const data = await fetchFromStrapi(STRAPI_URI!, STRAPI_TOKEN!, itemName, options)
        // console.log(data)
        return data
      } catch (e) {
        const msg = e instanceof Error ? e.message : e
        const warning: string[] = [`Error while trying to fetch ${itemName}:`, msg as string]
        console.warn(...warning)
        warnings.push(warning)
        return []
      }
    }
  }
}

function dummyStrapi(): Strapi {
  return {
    warnings: [['running in dummy mode.']],
    fetchItems: () => Promise.resolve([])
  }
}

async function fetchFromStrapi(uri: string, token: string, item: string, options?: object) {
  const url = new URL(item, uri)
  if (options) url.search = qs.stringify(options)
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error(`Fetch failed (${response.statusText}): ${await response.text()}`)
  return (await response.json()).data
}
