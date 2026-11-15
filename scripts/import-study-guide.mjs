// Imports the owner's A&P Knowledge Guide into the simulator's data.
//
//   node scripts/import-study-guide.mjs <path to the guide's .html>
//
// The guide is a single HTML page whose content is one data literal. This script
// reads that literal as data, keeps every topic and every point, and writes
// src/data/generated/studyGuide.json. Formatting is reduced to bold, italic and
// line breaks; nothing is reworded, shortened or left out.

import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

const [, , input] = process.argv
if (!input) {
  console.error('Usage: node scripts/import-study-guide.mjs <guide.html>')
  process.exit(1)
}
const html = readFileSync(input, 'utf8')

const ENTITIES = {
  times: '×', asymp: '≈', mdash: '—', ndash: '–', nbsp: '\u00a0', divide: '÷', deg: '°',
  pi: 'π', sup2: '²', amp: '&', minus: '−', middot: '·', rarr: '→', lt: '<', gt: '>',
  quot: '"', hellip: '…',
} // prettier-ignore

/** Plain text with only <b>, <i> and <br> left as markup. */
function clean(text) {
  const out = String(text)
    .replace(/<strong>/g, '<b>')
    .replace(/<\/strong>/g, '</b>')
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/&([a-z0-9]+);/gi, (whole, name) => {
      if (!(name in ENTITIES)) throw new Error(`Unknown entity ${whole}`)
      return ENTITIES[name]
    })
    .replace(/\u00a0+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
  const leftover = out.replace(/<\/?(b|i)>|<br>/g, '').match(/<[^>]*>/)
  if (leftover) throw new Error(`Unexpected markup ${leftover[0]} in: ${out.slice(0, 80)}`)
  return out
}

/** Formula boxes lay several expressions out with spacing; each becomes its own line. */
const cleanFormula = (text) =>
  clean(
    String(text)
      .replace(/(&nbsp;){2,}\s*/g, '<br>')
      .replace(/\s*<span[^>]*>/g, '<br>'),
  ).replace(/(<br>\s*)+/g, '<br>')

const slug = (title) =>
  title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

const start = html.indexOf('const DATA = ')
const end = html.indexOf('\n};', start)
if (start < 0 || end < 0) throw new Error('Could not find the guide data in the page')
const literal = html.slice(start + 'const DATA = '.length, end + 2)
// Evaluated as a bare data literal in an empty context: it has no access to this process.
const data = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })

const footnote = html.match(/<div class="footnote">([\s\S]*?)<\/div>/)
if (!footnote) throw new Error('Could not find the guide footnote')

const guide = {
  title: 'A&P Knowledge Guide',
  about: clean(footnote[1].replace(/\s+/g, ' ')),
  areas: Object.entries(data).map(([id, area]) => ({
    id,
    label: clean(area.label),
    intro: clean(area.intro),
    topics: area.topics.map((topic) => {
      const unknown = Object.keys(topic).filter((key) => !['t', 'hot', 'p', 'f'].includes(key))
      if (unknown.length > 0)
        throw new Error(`Topic "${topic.t}" has fields this import would drop: ${unknown}`)
      return {
        id: slug(topic.t),
        title: clean(topic.t),
        highPriority: topic.hot === true,
        points: topic.p.map(clean),
        ...(topic.f
          ? { formula: { label: clean(topic.f.label), body: cleanFormula(topic.f.body) } }
          : {}),
      }
    }),
  })),
}

const topics = guide.areas.flatMap((area) => area.topics)
const ids = new Set(topics.map((t) => t.id))
if (ids.size !== topics.length) throw new Error('Two topics produced the same id')

writeFileSync('src/data/generated/studyGuide.json', JSON.stringify(guide, null, 1) + '\n')
console.log(
  `${guide.areas.length} areas, ${topics.length} topics, ` +
    `${topics.reduce((sum, t) => sum + t.points.length, 0)} points, ` +
    `${topics.filter((t) => t.formula).length} formulas, ${topics.filter((t) => t.highPriority).length} high priority`,
)
