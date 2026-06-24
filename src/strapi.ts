import { loadEnv } from 'vite'
import qs from 'qs'
import process from 'node:process'

export interface Strapi {
  // deno-lint-ignore no-explicit-any
  fetchItems(itemName: string, options?: object): Promise<any[]> // eslint-disable-line @typescript-eslint/no-explicit-any
}

// strapi v5 uses string ids, numeric is deprecated
function use_documentid_as_id(object: { id?: string; documentId?: string }) {
  if (Array.isArray(object)) {
    object.forEach(use_documentid_as_id)
  } else if (object !== null && typeof object == 'object') {
    for (const [key, value] of Object.entries(object)) {
      if (key == 'documentId') {
        object.id = object.documentId
        delete object.documentId
      } else {
        use_documentid_as_id(value as { id?: string; documentId?: string }) // i lied
      }
    }
  }
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

  return {
    fetchItems: async (itemName: string, options?: object) => {
      try {
        const data = await fetchFromStrapi(STRAPI_URI!, STRAPI_TOKEN!, itemName, options)
        use_documentid_as_id(data)
        return data
      } catch (e) {
        const msg = e instanceof Error ? e.message : e
        console.warn(`Error while trying to fetch ${itemName}:`, msg)
        return []
      }
    }
  }
}

function dummyStrapi(): Strapi {
  return {
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
