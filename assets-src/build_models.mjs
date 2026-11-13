// Builds the .glb models: runs each Blender script headless, then optimises the
// result into public/models. Generated models are committed, so CI and people
// who only run the site never need Blender.
//
//   npm run models                 build everything
//   npm run models -- lookdev_tire build one model
//
// Set BLENDER to the Blender executable if it is not in the default location.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, textureCompress, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const scriptsDir = join(here, 'blender')
const outDir = join(here, '..', 'public', 'models')
const blender =
  process.env.BLENDER ??
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe'
    : 'blender')

/** Scripts whose names start with a letter are models; common.py holds shared helpers. */
function modelScripts(only) {
  return readdirSync(scriptsDir)
    .filter((file) => file.endsWith('.py') && file !== 'common.py' && !file.startsWith('_'))
    .map((file) => basename(file, '.py'))
    .filter((name) => only.length === 0 || only.includes(name))
}

function runBlender(name, rawPath) {
  const result = spawnSync(
    blender,
    [
      '--background',
      '--factory-startup',
      '--python-exit-code',
      '1',
      '--python',
      join(scriptsDir, `${name}.py`),
      '--',
      '--out',
      rawPath,
    ],
    { encoding: 'utf8' },
  )
  if (result.error) {
    throw new Error(`Could not start Blender at "${blender}": ${result.error.message}`)
  }
  if (result.status !== 0 || !existsSync(rawPath)) {
    throw new Error(`Blender failed on ${name}.py:\n${result.stdout}\n${result.stderr}`)
  }
}

async function optimise(rawPath, outPath) {
  await MeshoptDecoder.ready
  await MeshoptEncoder.ready
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  })
  const document = await io.read(rawPath)
  await document.transform(
    dedup(),
    prune(),
    weld(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048] }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  )
  await io.write(outPath, document)
}

const only = process.argv.slice(2)
const names = modelScripts(only)
if (names.length === 0) {
  console.error(
    only.length ? `No model script named: ${only.join(', ')}` : 'No model scripts found',
  )
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
const workDir = join(tmpdir(), `a320-models-${process.pid}`)
mkdirSync(workDir, { recursive: true })

try {
  for (const name of names) {
    const rawPath = join(workDir, `${name}.raw.glb`)
    const outPath = join(outDir, `${name}.glb`)
    runBlender(name, rawPath)
    await optimise(rawPath, outPath)
    const kb = (size) => `${(size / 1024).toFixed(0)} kB`
    console.log(`${name}: ${kb(statSync(rawPath).size)} -> ${kb(statSync(outPath).size)}`)
  }
} finally {
  rmSync(workDir, { recursive: true, force: true })
}
