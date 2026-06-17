// deno run watch

// a little wrapper for `deno run dev` but it automatically restarts upon file errors. (like swapping branches or moving files around)

import { delay } from 'jsr:@std/async/delay'

const decoder = new TextDecoder()

async function start() {
  const child = new Deno.Command(Deno.execPath(), {
    args: ['task', 'dev'],
    stdout: 'piped',
    stderr: 'piped',
    env: {
      FORCE_COLOR: '1'
    }
  }).spawn()

  async function handle(stream: ReadableStream<Uint8Array>) {
    for await (const chunk of stream) {
      await Deno.stdout.write(chunk)
      if (decoder.decode(chunk).includes('Please make sure the file exists')) {
        console.log('ohno!')
        await delay(1000)
        child.kill()
        await child.status
        start()
      }
    }
  }

  await Promise.all([handle(child.stdout), handle(child.stderr)])
}

start()
