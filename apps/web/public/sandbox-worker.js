// Sandbox Web Worker for safe JavaScript execution
// No access to DOM, fetch, or filesystem

const originalLog = console.log
const originalWarn = console.warn
const originalError = console.error

self.onmessage = function (e) {
  const { code, id } = e.data
  const logs = []

  // Intercept console methods
  console.log = function (...args) {
    logs.push({ type: 'log', message: args.map(stringify).join(' '), timestamp: Date.now() })
  }
  console.warn = function (...args) {
    logs.push({ type: 'warn', message: args.map(stringify).join(' '), timestamp: Date.now() })
  }
  console.error = function (...args) {
    logs.push({ type: 'error', message: args.map(stringify).join(' '), timestamp: Date.now() })
  }

  try {
    // Block dangerous globals
    const blockedGlobals = ['fetch', 'XMLHttpRequest', 'importScripts', 'WebSocket']
    const blockCode = blockedGlobals
      .map(function (g) { return 'var ' + g + ' = undefined;' })
      .join('\n')

    const wrappedCode = '"use strict";\n' + blockCode + '\n' + code

    // Execute with timeout via the caller
    const result = new Function(wrappedCode)()

    if (result !== undefined) {
      logs.push({ type: 'log', message: '→ ' + stringify(result), timestamp: Date.now() })
    }

    self.postMessage({ id: id, logs: logs, error: null })
  } catch (err) {
    logs.push({
      type: 'error',
      message: (err.name || 'Error') + ': ' + (err.message || String(err)),
      timestamp: Date.now(),
      line: err.lineNumber || null,
    })
    self.postMessage({ id: id, logs: logs, error: err.message })
  }

  // Restore
  console.log = originalLog
  console.warn = originalWarn
  console.error = originalError
}

function stringify(val) {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') {
    try { return JSON.stringify(val, null, 2) } catch (_e) { return String(val) }
  }
  return String(val)
}
