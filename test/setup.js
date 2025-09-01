// Test setup for vitest with jsdom
import { beforeEach } from 'vitest'

// Clean up DOM between tests
beforeEach(() => {
  document.body.innerHTML = ''
})