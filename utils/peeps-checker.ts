// checks the peeps against staff & volunteers speadsheet.

// deno run --allow-read utils/peeps-checker.ts

// head to said spreadsheet and replace /edit in the url with /preview, then copy paste this command into the browser console:
// JSON.stringify(Array.from(document.querySelectorAll('tr')).slice(3).map(row => Array.from(row.children).slice(1, 4).map(cell => cell.innerText)).filter(row => row[1].length > 1))
// then copy paste the output in here and run the script:

const json = ``

let all_volunteers = JSON.parse(json)
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
