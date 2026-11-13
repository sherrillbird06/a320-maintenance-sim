/**
 * URL of a file in the public folder. The site is served from a sub-path on
 * GitHub Pages, so every asset URL has to be built from the base.
 */
export function assetUrl(path: string, base: string = import.meta.env.BASE_URL): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

/** URL of a model built by `npm run models`. */
export function modelUrl(name: string, base: string = import.meta.env.BASE_URL): string {
  return assetUrl(`models/${name}.glb`, base)
}

/** Wording for the panel shown when a model or texture fails to load. */
export function describeLoadError(url: string, error: unknown): { title: string; body: string } {
  const file = url.split('/').pop() ?? url
  const reason = error instanceof Error && error.message ? ` (${error.message})` : ''
  return {
    title: 'Part of the simulator could not be loaded',
    body: `The file ${file} did not load${reason}. Check your connection and reload the page.`,
  }
}

/** Which of the given asset URLs a loader error refers to, if any. */
export function failedAsset(error: unknown, urls: string[]): string | undefined {
  if (!(error instanceof Error)) return undefined
  return urls.find((url) => {
    const file = url.split('/').pop()
    return error.message.includes(url) || (file !== undefined && error.message.includes(file))
  })
}
