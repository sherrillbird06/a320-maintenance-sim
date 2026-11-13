import type { Page } from '@playwright/test'

export interface PageProblems {
  consoleErrors: string[]
  failedRequests: string[]
}

/** Records console errors and failed or 4xx/5xx requests for the life of the page. */
export function watchPage(page: Page): PageProblems {
  const problems: PageProblems = { consoleErrors: [], failedRequests: [] }
  page.on('console', (message) => {
    if (message.type() === 'error') problems.consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => problems.consoleErrors.push(error.message))
  page.on('requestfailed', (request) => problems.failedRequests.push(request.url()))
  page.on('response', (response) => {
    if (response.status() >= 400) {
      problems.failedRequests.push(`${response.status()} ${response.url()}`)
    }
  })
  return problems
}
