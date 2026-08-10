// deno run --allow-env --env-file=.env.local --allow-net utils/strapi-registration-sync.ts

import assert from 'node:assert'
import { DOMParser } from 'deno-dom';

const { PLATYPLUS_ADMIN_USERNAME, PLATYPLUS_ADMIN_PASSWORD, STRAPI_URI, PLATYPLUS_STRAPI_TOKEN } = Deno.env.toObject()

assert(PLATYPLUS_ADMIN_USERNAME)
assert(PLATYPLUS_ADMIN_PASSWORD)
assert(STRAPI_URI)
assert(PLATYPLUS_STRAPI_TOKEN)

// const cookies = new Map()
let cookies = ''
let csrf = ''

function cookiejar(response: Response) {
  // response.headers.getSetCookie().forEach((cookie: string) => {
  //   const key_and_value = cookie.split(';')[0]
  //   cookies.set(key_and_value.split('=')[0], key_and_value.split('=')[1])
  // })
  cookies = response.headers.getSetCookie().map((cookie: string) => cookie.split(';')[0]).join('; ')
  csrf = /fluufff_registration_csrf_fluufff_registration_=(\w+)/.exec(cookies)![1]
}

const response1 = await fetch('https://registration.fluufff.org/profile/login')
cookiejar(response1)
// console.log(cookies)
// const body1 = await response1.text()
// const csrf = /<input type="hidden" name="csrf_fluufff_registration_" value="(.*)" \/>/.exec(body1)![1]

// console.log(Array.from(cookies).join(' '))
// console.log(cookies.get('fluufff_registration_csrf_fluufff_registration_'))

await fetch(
  "https://registration.fluufff.org/profile/login?from=register",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // "Cookie": `fluufff_registration_csrf_fluufff_registration_=${csrf}`
      // "Cookie": Array.from(cookies).join(' '),
      "Cookie": cookies,
    },
    body: new URLSearchParams({
      // csrf_fluufff_registration_: cookies.get('fluufff_registration_csrf_fluufff_registration_'),
      csrf_fluufff_registration_: csrf,
      email: PLATYPLUS_ADMIN_USERNAME,
      password: PLATYPLUS_ADMIN_PASSWORD,
      keep: 'N',
      send: '',
    }),
    // redirect: 'manual',
  },
);

// console.log(response2.headers.getSetCookie())
// console.log(await response2.text())
// cookiejar(e)

// console.log(cookies)
// console.log(csrf)

// const response3 = await fetch(
//   https://registration.fluufff.org/admin/bookings/
// )

const response3 = await fetch(
  "https://registration.fluufff.org/admin/bookings/",
  {
    method: "GET",
    headers: {
      "Cookie": cookies,
    },
  },
);


const document = new DOMParser().parseFromString(await response3.text(), 'text/html');
const table: HTMLTableElement = document.querySelector('table')!;
const rows: HTMLCollection = table!.children[1].children;
// console.log(document.querySelector());

let category = '' // "goodie"|"room"|"ticket"

function get_min_max(string: string) { // "100/200" -> {min: 100, max: 200}
  const cur_max = string.split('/')
  return {
    min: parseInt(cur_max[0]),
    max: parseInt(cur_max[1]),
  }
}

const output = Array.from(rows).map(row => {
  const title = row.children[0].textContent.trim()
  if (row.children.length == 1) {
    category = title.toLowerCase()
    return
  }

  switch(category) {
    case 'goodie': {
      const min_max = get_min_max(row.children[2].textContent)
      return {type: category, name: title, left: min_max.max - min_max.min}
    }
    case 'room': {
      const places = parseInt(row.children[1].textContent)
      const min_max = get_min_max(row.children[4].textContent)
      return {type: category, name: title, left: (min_max.max - min_max.min) / places}
    }
    case 'ticket': {
      const min_max = get_min_max(row.children[2].textContent)
      return {type: category, name: title, left: min_max.max - min_max.min}
    }
  }

  // return Array.from(row.children).map((cell) => cell.textContent)

  // console.log(Array.from(row.children).map((cell) => {
  //   switch(category) {
  //     case 'Goodie':
  //       return cell.textContent.trim()
  //   }
  // }))
}).filter(row => {
  if (!row) return false;

  if (row.name.includes('Staff')) return false;
  if (row.name.includes('T-Shirt')) return false;
  if (row.name.includes('DISCOUNTED')) return false;
  if (row.name.endsWith('Early Arrival')) return false;
  if (row.name.endsWith('Late Departure')) return false;

  if (row.type == 'ticket') return false;

  return true;
})

console.log(output)

const response4 = await fetch(
  `${STRAPI_URI}reg-bookings`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PLATYPLUS_STRAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
  },
);

const reg_bookings = await response4.json()
reg_bookings.data.forEach(async (reg_booking: {documentId: string}) => {
  await fetch(
    `${STRAPI_URI}reg-bookings/${reg_booking.documentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${PLATYPLUS_STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );
})

for (const reg_booking of output) {
  const response5 = await fetch(
    `${STRAPI_URI}reg-bookings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PLATYPLUS_STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      data: {
        type: reg_booking!.type,
        name: reg_booking!.name,
        available: reg_booking!.left
      },
    }),
    },
  );
  console.log(await response5.text())
}

// console.log(await response.json())
