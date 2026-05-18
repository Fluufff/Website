// checks the peeps against staff & volunteers speadsheet.

// deno run --allow-env --env-file=.env.local --allow-net --allow-read utils/peeps-checker.ts

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

// find the name of the first sheet
const spreadsheet_meta_response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${PEEPS_SPREADSHEET_ID}`, {
  headers: {
    Authorization: `Bearer ${access_token}`
  }
})
const spreadsheet_meta_json = await spreadsheet_meta_response.json()
const sheet_title = spreadsheet_meta_json['sheets'][0]['properties']['title']

// get the contents of the first sheet
const speadsheet_values_response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${PEEPS_SPREADSHEET_ID}/values:batchGet?ranges=${encodeURI(sheet_title)}`, {
  headers: {
    Authorization: `Bearer ${access_token}`
  }
})
const spreadsheet_values_json = await speadsheet_values_response.json()
const spreadsheat_values_rows = spreadsheet_values_json['valueRanges'][0]['values']

// resume legacy code
let all_volunteers = spreadsheat_values_rows
all_volunteers = all_volunteers.filter((row: string[]) => ['Head', 'Deputy'].includes(row[2])) // role filter

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
  const volunteers = all_volunteers.filter((volunteer: string[]) => volunteer[0].includes(peep[0]))
  if (volunteers.length == 0) {
    console.log(`peep "${peep[0]}" (${peep[1]}) seems to be a regular volunteer.`)
  } else {
    volunteer_name_to_peep_map.set(volunteers[0][0], peep)

    for (const role of peep[1]) {
      if (role == "Chairman") continue;
      const volunteer = volunteers.find((volunteer: string[]) => {
        return role == `${volunteer[2]} of ${volunteer[1]}`
      })
      if (!volunteer) {
        console.log(`peep "${peep[0]}" seems to no longer hold the "${role}" role.`)
      }
    }
  }
})

all_volunteers.forEach((volunteer: string[]) => {
  const peep = volunteer_name_to_peep_map.get(volunteer[0])
  const role = `${volunteer[2]} of ${volunteer[1]}`
  if (peep == undefined) {
    console.log(`volunteer "${volunteer[0]}" lacks a peep for their "${role}" role.`)
  } else {
    if (!peep[1].includes(role)) {
      console.log(`volunteer "${volunteer[0]}" lacks a mention of their "${role}" role.`)
    }
  }
})
