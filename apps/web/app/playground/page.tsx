'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CodeEditor, DEFAULT_CODE } from '@/components/playground/code-editor'
import { OutputPanel, type LogEntry } from '@/components/playground/output-panel'
import { EditorToolbar } from '@/components/playground/editor-toolbar'
import { CURRICULUM } from '@/lib/lesson/curriculum'

export default function PlaygroundPage() {
  const searchParams = useSearchParams()
  const exerciseId = searchParams.get('exercise')

  const [code, setCode] = useState(() => {
    if (exerciseId && CURRICULUM[exerciseId]?.exercise) {
      return `// Exercício: ${CURRICULUM[exerciseId].name}\n${CURRICULUM[exerciseId].exercise}\n`
    }
    return DEFAULT_CODE
  })

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleRun = useCallback(() => {
    setIsRunning(true)

    // Terminate previous worker if any
    workerRef.current?.terminate()

    const worker = new Worker('/sandbox-worker.js')
    workerRef.current = worker
    const runId = Date.now()

    // 5 second timeout
    timeoutRef.current = setTimeout(() => {
      worker.terminate()
      setLogs((prev) => [
        ...prev,
        { type: 'error', message: 'Timeout: execução excedeu 5 segundos', timestamp: Date.now() },
      ])
      setIsRunning(false)
    }, 5000)

    worker.onmessage = (e) => {
      if (e.data.id === runId) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setLogs((prev) => [...prev, ...e.data.logs])
        setIsRunning(false)
        worker.terminate()
      }
    }

    worker.onerror = (err) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setLogs((prev) => [
        ...prev,
        { type: 'error', message: `Worker error: ${err.message}`, timestamp: Date.now() },
      ])
      setIsRunning(false)
      worker.terminate()
    }

    worker.postMessage({ code, id: runId })
  }, [code])

  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE)
    setLogs([])
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
  }, [code])

  const handleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-64px)] bg-matrix-bg"
    >
      <EditorToolbar
        onRun={handleRun}
        onReset={handleReset}
        onCopy={handleCopy}
        onFullscreen={handleFullscreen}
        isRunning={isRunning}
        isFullscreen={isFullscreen}
      />

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Editor Panel */}
        <div className="flex-1 min-h-[200px] md:min-h-0">
          <CodeEditor value={code} onChange={setCode} />
        </div>

        {/* Output Panel */}
        <div className="h-[200px] md:h-auto md:w-[400px] shrink-0">
          <OutputPanel logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>
    </div>
  )
}
