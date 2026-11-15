/** A run of text with its emphasis, or a line break. */
export type RichPart = { text: string; bold: boolean; italic: boolean } | { lineBreak: true }

/**
 * Splits text that uses only `<b>`, `<i>` and `<br>` into parts that can be
 * drawn without handing markup to the browser. Anything else is kept as text.
 */
export function parseRich(source: string): RichPart[] {
  const parts: RichPart[] = []
  let bold = false
  let italic = false
  for (const token of source.split(/(<\/?b>|<\/?i>|<br>)/)) {
    if (token === '<b>') bold = true
    else if (token === '</b>') bold = false
    else if (token === '<i>') italic = true
    else if (token === '</i>') italic = false
    else if (token === '<br>') parts.push({ lineBreak: true })
    else if (token !== '') parts.push({ text: token, bold, italic })
  }
  return parts
}
