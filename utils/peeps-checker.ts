// checks the peeps against staff & volunteers speadsheet.

// deno run --allow-env --env-file=.env.local --allow-net --allow-read --allow-write utils/peeps-checker.ts

import assert from 'node:assert'

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
const spreadsheet_header = spreadsheet_rows
  .shift()
  ['values'].map((row: Record<string, string>) => row['formattedValue'])
assert.equal(spreadsheet_header.join(', '), 'Team member, Department, Role, Notes')

// deno-lint-ignore no-explicit-any
let all_volunteers: Record<string, string>[] = spreadsheet_rows.map((spreadsheet_row: any) => {
  return {
    id: spreadsheet_row['values'][0]['chipRuns'][0]['chip']['personProperties']['email'],
    name: spreadsheet_row['values'][0]['formattedValue'],
    department: spreadsheet_row['values'][1]['formattedValue'],
    role: spreadsheet_row['values'][2]?.['formattedValue']
  }
})

// console.log(all_volunteers)
all_volunteers = all_volunteers.filter((volunteer) => ['Head', 'Deputy'].includes(volunteer.role)) // role filter
// console.log(all_volunteers)

let peeps: { id: string; name: string; titles: string[]; }[] = JSON.parse(Deno.readTextFileSync('./src/data/hr/peeps.json'))

function get_department_name_to_display(string: string) {
  string = string.replace('Reg', 'Registration')
  string = string.replace('IT & Web', 'IT')
  return string
}

all_volunteers.forEach((volunteer) => {
  const peep = peeps.find(peep => peep.id == volunteer.id)
  const title = `${volunteer.role} of ${get_department_name_to_display(volunteer.department)}`

  if (! peep) {
    return peeps.push({
      id: volunteer.id,
      name: volunteer.name,
      titles: [title]
    })
  }
  
  if (! peep.titles.includes(title)) {
    peep.titles.push(title)
  }
})

peeps = peeps.filter((peep) => {
  const volunteers = all_volunteers.filter(volunteer => volunteer.id == peep.id)

  peep.titles = peep.titles.filter(title => {
    return title == "Chairman" || volunteers.find(volunteer => {
      return `${volunteer.role} of ${get_department_name_to_display(volunteer.department)}` == title
    })
  })

  return peep.titles.length > 0;
})

Deno.writeTextFileSync("./src/data/hr/peeps.json", JSON.stringify(peeps, null, 2) + "\n")
