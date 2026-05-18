// used to get a refresh token for the google spreadsheets you can see with your own account.

// after setting up the spreadsheat oauth api put the id & secret in .env.local
// deno run --allow-env --env-file=.env.local --allow-net utils/google-oauth.ts

const { PEEPS_CLIENT_ID, PEEPS_CLIENT_SECRET } = Deno.env.toObject()

const params = new URLSearchParams({
  client_id: PEEPS_CLIENT_ID,
  redirect_uri: 'http://localhost:8000/callback',
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
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
