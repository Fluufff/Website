// checks the peeps against staff & volunteers speadsheet.

// deno run --allow-env --env-file=.env.local --allow-net --allow-read utils/peeps-checker.ts

import assert from 'node:assert';

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
const spreadsheet_response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${PEEPS_SPREADSHEET_ID}?` + new URLSearchParams({
  includeGridData: 'true',
  fields: 'sheets.data.rowData.values(formattedValue,chipRuns)',
}), {
  headers: {
    Authorization: `Bearer ${access_token}`
  }
})
const spreadsheet_json = await spreadsheet_response.json()
const spreadsheet_rows = spreadsheet_json['sheets'][0]['data'][0]['rowData']

// this script operates under the assumption that the first sheet contains these columns
const spreadsheet_header = spreadsheet_rows.shift()['values'].map((row: Record<string, string>) => row['formattedValue'])
assert.equal(spreadsheet_header.join(', '), 'Team member, Department, Role, Notes')


// deno-lint-ignore no-explicit-any
let all_volunteers: Record<string, string>[] = spreadsheet_rows.map((spreadsheet_row: any) => {
  return {
    id: spreadsheet_row['values'][0]['chipRuns'][0]['chip']['personProperties']['email'],
    name: spreadsheet_row['values'][0]['formattedValue'],
    department: spreadsheet_row['values'][1]['formattedValue'],
    role: spreadsheet_row['values'][2]?.['formattedValue'],
  }
})

all_volunteers = all_volunteers.filter(volunteer => ['Head', 'Deputy'].includes(volunteer.role)) // role filter

const about = Deno.readTextFileSync('./src/pages/about.astro')
const peeps = Array.from(about.matchAll(/Peep name="(.*)" title=["{](.*?)[}"]/g)).map((result) => [
  result[1],
  result[2]
]) // ["name", "roles"]
peeps.forEach((peep) => (peep[1] = peep[1].charAt(0) == '[' ? JSON.parse(peep[1].replaceAll("'", '"')) : [peep[1]])) // ["name", ["role"]]
peeps.forEach((peep) => {
  // fix discrepencies between peep & speadsheet department names
  peep[1] = peep[1].map((role: string) => {
    role = role.replace('Registration', 'Reg')
    role = role.replace('IT', 'IT & Web')
    return role
  })
})

const volunteer_name_to_peep_map = new Map()

peeps.forEach((peep: string[]) => {
  const volunteers = all_volunteers.filter(volunteer => volunteer['name'].includes(peep[0]))
  if (volunteers.length == 0) {
    console.log(`peep "${peep[0]}" (${peep[1]}) seems to be a regular volunteer.`)
  } else {
    volunteer_name_to_peep_map.set(volunteers[0]['name'], peep)

    for (const role of peep[1]) {
      if (role == 'Chairman') continue
      const volunteer = volunteers.find(volunteer => {
        return role == `${volunteer['role']} of ${volunteer['department']}`
      })
      if (!volunteer) {
        console.log(`peep "${peep[0]}" seems to no longer hold the "${role}" role.`)
      }
    }
  }
})

all_volunteers.forEach(volunteer => {
  const peep = volunteer_name_to_peep_map.get(volunteer['name'])
  const role = `${volunteer['role']} of ${volunteer['department']}`
  if (peep == undefined) {
    console.log(`volunteer "${volunteer['name']}" lacks a peep for their "${role}" role.`)
  } else {
    if (!peep[1].includes(role)) {
      console.log(`volunteer "${volunteer['name']}" lacks a mention of their "${role}" role.`)
    }
  }
})
