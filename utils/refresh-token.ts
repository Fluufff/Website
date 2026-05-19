// obtains an access token from your refresh token in case you want to call an api manually.

// deno run --allow-env --env-file=.env.local --allow-net utils/refresh-token.ts

const { PEEPS_CLIENT_ID, PEEPS_CLIENT_SECRET, PEEPS_REFRESH_TOKEN } = Deno.env.toObject()

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

console.log(access_token)
