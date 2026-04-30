// deno run --allow-net="api.figma.com" --allow-write="charter.scss" utils/figma-colors.ts

// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

import { assert } from 'node:console'

const FIGMA_TOKEN = "figd_";
const FIGMA_FILE_ID = "Dl4I0OJqlpDyBwtHWv8D43"

// stage 1, retrieve styles

const response = await fetch(
  `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`,
  {
    method: "GET",
    headers: {
      "X-Figma-Token": FIGMA_TOKEN,
      "Content-Type": "application/json",
    },
  }
);

const json = await response.json();

const keys = [];
const keys_to_id = new Map();

for (const [style_id, style] of Object.entries(json['styles']) as [string, any]) {
  if (style['styleType'] != "FILL") continue;
  if (!style['name'].startsWith('Fl')) continue; // Fl uufff/üüfff

  const name = style['name'].replace(/\/50$/, '/050');

  keys.push(name);
  keys_to_id.set(name, style_id);
}

keys.sort();
// console.log(keys);

// stage 2, resolve styles

const params = new URLSearchParams({
  ids: Array.from(keys_to_id.values()).join(","),
});

const response2 = await fetch(
`https://api.figma.com/v1/files/${FIGMA_FILE_ID}/nodes?${params}`,
{
  method: "GET",
  headers: {
    "X-Figma-Token": FIGMA_TOKEN,
    "Content-Type": "application/json",
  },
})

const json2 = await response2.json();

const style_id_to_hex = new Map();

for (const [style_id, node] of Object.entries(json2['nodes']) as [string, any]) {
  const color = node.document.fills[0].color
  const bytes: any = new Uint8Array([color.r * 255, color.g * 255, color.b * 255]);
  const hex = '#' + bytes.toHex();

  style_id_to_hex.set(style_id, hex);
}

// stage 3, convert to scss

let current_group = '';
const current_group_bits: any = [];

const output_lines = [];

function flush_current_group_bits()
{
  output_lines.push('');
  output_lines.push(`$${current_group}: (`)
  for (const bits of current_group_bits) {
    output_lines.push(`  ${bits[2]}: $${bits[1]}-${bits[2]},`);
  }
  output_lines.push(');')
  current_group_bits.length = 0
}

for (const key of keys) {
  const bits = key.toLowerCase().replaceAll(' ', '').split('/');
  assert(bits.length == 3, `"${key}" does not have exactly two forward slashes.`);

  if (!bits[0].endsWith('26')) continue;

  bits[2] = bits[2].replace(/^0+/, ''); // remove leading zero used for sorting

  if (current_group == '') current_group = bits[1];

  if (current_group != bits[1]) {
    flush_current_group_bits();
    current_group = bits[1];
    output_lines.push('');
  }

  current_group_bits.push(bits);
  output_lines.push(`$${bits[1]}-${bits[2]}: ${style_id_to_hex.get(keys_to_id.get(key))};`);
}

flush_current_group_bits();

const output_txt = output_lines.join("\n") + "\n";
console.log(output_txt);
Deno.writeTextFileSync("charter.scss", output_txt);
