// deno run --allow-env --env-file=.env.local --allow-net utils/google-oauth-handshake.ts

// This script helps you in obtaining a personal access/refresh token for the google api from scratch.
// (it was written with the peeps script in mind, you might need to deviate slightly from these steps)

// 1) go to https://console.cloud.google.com/ and create a project (e.g. `peeps-quezler`)
// 2) head to "API's & Services" and click the "+ Enable APIs and services" button
// 3) search for the one(s) that you need and enable them (e.g. `Google Sheets API`)
// 4) head to the "Credentials" section, either from the sidebar or the enabled api page
// 5) click the "+ Create credentials" button and select the "OAuth client ID" option (NOT the "API Key" option)
// 6) it will ask you to create a consent screen first, go there and create one (e.g. `fluufff-peeps-quezler`)
// 7) find your way to the "+ Create credentials" button again
// 8) configure it as a "Web Application" and set `http://localhost:8000/callback` as redirect (e.g. `Fluufff peeps quezler`)
// 9) download the json file just in case, and add the id & secret to .env.local (e.g. PEEPS_CLIENT_ID & PEEPS_CLIENT_SECRET)

// now you are ready to perform the handshake, run the command at the top of the file and follow the flow.
// you should end up on a blank browser page which can be closed, check the output of the command for the refresh token.
// note that the access token expires in one hour, you should save the refresh token in .env.local (e.g. PEEPS_REFRESH_TOKEN)

const { PEEPS_CLIENT_ID, PEEPS_CLIENT_SECRET } = Deno.env.toObject()

const params = new URLSearchParams({
  client_id: PEEPS_CLIENT_ID,
  redirect_uri: 'http://localhost:8000/callback',
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/spreadsheets.readonly', // the scopes that you want (with a space in between)
  access_type: 'offline',
  prompt: 'consent'
})

const auth_url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
console.log(`open in your browser:\n\n${auth_url}\n`)

Deno.serve((_req) => {
  const url = new URL(_req.url)
  const query = new URLSearchParams(url.search)

  if (url.pathname == '/callback') {
    const params = new URLSearchParams({
      client_id: PEEPS_CLIENT_ID,
      client_secret: PEEPS_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: query.get('code') as string,
      redirect_uri: 'http://localhost:8000/callback'
    })

    fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    }).then((res) => {
      res.json().then((json) => {
        console.log(json)
        Deno.exit()
      })
    })
  }

  return new Response('')
})
