// checks the peeps against staff & volunteers speadsheet.

// deno run --allow-env --env-file=.env.local --allow-net --allow-write utils/peeps-checker.ts

import assert from 'node:assert'

interface Volunteer {
  id: string
  name: string
  department: string
  role: string
}

interface Peep {
  id: string
  name: string
  titles: string[]
}

const { PEEPS_CLIENT_ID, PEEPS_CLIENT_SECRET, PEEPS_REFRESH_TOKEN, PEEPS_SPREADSHEET_ID } = Deno.env.toObject()

// get access token from refresh token
const access_token_response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    client_id: PEEPS_CLIENT_ID,
    client_secret: PEEPS_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: PEEPS_REFRESH_TOKEN
  })
})
const access_token_json = await access_token_response.json()
const access_token = access_token_json['access_token']

// retrieve the volunteers list
const spreadsheet_response = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${PEEPS_SPREADSHEET_ID}?` +
    new URLSearchParams({
      includeGridData: 'true',
      fields: 'sheets.data.rowData.values(formattedValue,chipRuns)'
    }),
  {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }
)
const spreadsheet_json = await spreadsheet_response.json()
const spreadsheet_rows = spreadsheet_json['sheets'][0]['data'][0]['rowData']

// this script operates under the assumption that the first sheet contains these columns
const spreadsheet_header_row = spreadsheet_rows.shift()
const spreadsheet_header = spreadsheet_header_row['values'].map((row: Record<string, string>) => row['formattedValue'])
assert.equal(spreadsheet_header.join(', '), 'Team member, Department, Role, Notes')

/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore no-explicit-any
let all_volunteers: Volunteer[] = spreadsheet_rows.map((spreadsheet_row: any) => {
  return {
    id: spreadsheet_row['values'][0]['chipRuns'][0]['chip']['personProperties']['email'].split('@')[0],
    name: spreadsheet_row['values'][0]['formattedValue'],
    department: spreadsheet_row['values'][1]['formattedValue'],
    role: (spreadsheet_row['values'][2]?.['formattedValue'] ?? '').trim() // `Ress` is `Deputy ` of `HR`
  }
})
/* eslint-enable @typescript-eslint/no-explicit-any */

// console.log(all_volunteers)
all_volunteers = all_volunteers.filter((volunteer) => ['Head', 'Deputy'].includes(volunteer.role))
// console.log(all_volunteers)

const peeps: Peep[] = []

function get_department(string: string) {
  string = string.replace('Reg', 'Registration')
  string = string.replace('IT & Web', 'IT')
  return string
}

function get_title(volunteer: Volunteer) {
  return `${volunteer.role} of ${get_department(volunteer.department)}`
}

// if a volunteer has a space in the name then pick the word matching their username
function get_name(volunteer: Volunteer) {
  if (volunteer.name.includes(' ')) {
    const candidate = volunteer.name.split(' ').find((word) => word.toLowerCase() == volunteer.id)
    if (candidate) {
      return candidate
    }
  }

  return volunteer.name
}

all_volunteers.forEach((volunteer) => {
  const peep = peeps.find((peep) => peep.id == volunteer.id)
  const title = get_title(volunteer)

  if (!peep) {
    return peeps.push({
      id: volunteer.id,
      name: get_name(volunteer),
      titles: [title]
    })
  }

  if (!peep.titles.includes(title)) {
    peep.titles.push(title)
  }
})

// gives them an additional role
function crown(id: string, title: string) {
  const i = peeps.findIndex((peep) => peep.id == id)
  if (i !== -1) {
    const peep = peeps[i]

    peep.titles.unshift(title)
  }
}

// puts them at the front
function hoist(id: string) {
  const i = peeps.findIndex((peep) => peep.id == id)
  if (i !== -1) {
    const peep = peeps[i]

    peeps.splice(i, 1)
    peeps.unshift(peep)
  }
}

hoist('faelan')
hoist('jawbreaker')
crown('jawbreaker', 'Chairman')

Deno.writeTextFileSync('./src/data/hr/peeps.json', JSON.stringify(peeps, null, 2) + '\n')
