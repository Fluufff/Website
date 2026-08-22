import { marked } from 'marked'

export function render_markdown(markdown: string): string {
  return marked.parse(markdown.replace(/^$/gm, '<br />\n'), { breaks: true }) as string
}
