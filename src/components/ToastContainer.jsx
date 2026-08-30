import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { toastService } from './toast-service'
import Toast from './Toast'
import './Toast.css'

/* Toast portal container — ported from the design-system source
   (types stripped). Sonner-style stacked layout, bottom-left. */

const LEAVE_DURATION = 400

export function ToastContainer() {
  const [slots, setSlots] = useState([])
  /* JS-tracked hover so the expanded stack stays expanded when the mouse
   * moves through the 8px gap between two toasts. */
  const [hovered, setHovered] = useState(false)
  /* Measured height per toast id, for the stagger + clip math. */
  const [heights, setHeights] = useState({})
  /* Frozen max-height per slot, set the first time it leaves index 0 —
   * so a later, taller front can't re-expand a shrunk back toast. */
  const [frozenMaxHeights, setFrozenMaxHeights] = useState({})
  const slotElementsRef = useRef(new Map())
  const mountedRef = useRef(new Set())
  const observersRef = useRef(new Map())
  /* Last stack-index a slot held while active, so exit styling keeps
   * applying through the fade-out. */
  const lastStackIndexRef = useRef(new Map())

  const handlePortalEnter = useCallback(() => {
    setHovered(true)
    toastService.pauseAll()
  }, [])

  const handlePortalLeave = useCallback(() => {
    setHovered(false)
    toastService.resumeAll()
  }, [])

  /* Stable per-id ref callbacks. An inline `ref={(el) => setRef(id, el)}`
   * would be a new function each render, making React detach + reattach
   * the ref every render — each reattach re-created the ResizeObserver
   * and re-measured, which set state during commit and looped the
   * render cycle to death once two toasts were stacked. */
  const refCallbacksRef = useRef(new Map())

  const removeSlot = useCallback((id) => {
    setSlots((prev) => prev.filter((s) => s.id !== id))
    setFrozenMaxHeights((prev) => {
      if (prev[id] === undefined) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    mountedRef.current.delete(id)
    lastStackIndexRef.current.delete(id)
    refCallbacksRef.current.delete(id)
    toastService.dismiss(id)
  }, [])

  const animateLeave = useCallback(
    (id) => {
      setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, leaving: true } : s)))
      setTimeout(() => removeSlot(id), LEAVE_DURATION)
    },
    [removeSlot],
  )

  useEffect(() => {
    const unsub = toastService.subscribe((toasts, evictedIds) => {
      setSlots((prev) => {
        const toastById = new Map(toasts.map((t) => [t.id, t]))
        const evicted = new Set(evictedIds ?? [])
        const result = []
        for (const slot of prev) {
          const updated = toastById.get(slot.id)
          if (updated) {
            result.push({ ...slot, ...updated })
          } else if (!slot.leaving) {
            const wasEvicted = evicted.has(slot.id)
            result.push({ ...slot, leaving: true, evicted: wasEvicted })
            setTimeout(() => removeSlot(slot.id), LEAVE_DURATION)
          } else {
            result.push(slot)
          }
        }
        for (const t of toasts) {
          if (!result.some((s) => s.id === t.id)) {
            result.push({ ...t, leaving: false, evicted: false })
          }
        }
        return result
      })
    })
    return unsub
  }, [removeSlot])

  /* Freeze each slot's max-height the first time it leaves index 0 and
   * the new front has been measured. */
  useEffect(() => {
    const activeIds = slots.filter((s) => !s.leaving).map((s) => s.id)
    if (activeIds.length < 2) return
    const frontId = activeIds[activeIds.length - 1]
    const frontHeight = heights[frontId]
    if (frontHeight === undefined) return

    setFrozenMaxHeights((prev) => {
      let updates = null
      for (let i = 0; i < activeIds.length - 1; i++) {
        const id = activeIds[i]
        if (prev[id] !== undefined) continue
        if (!updates) updates = {}
        updates[id] = (frontHeight + 14) / 0.93
      }
      return updates ? { ...prev, ...updates } : prev
    })
  }, [slots, heights])

  // First mount: paint in the entering state, release next frame so the
  // transition slides it up. Also observe the toast's natural height.
  const setRef = useCallback((id, el) => {
    if (!el) {
      const existing = observersRef.current.get(id)
      if (existing) {
        existing.disconnect()
        observersRef.current.delete(id)
      }
      slotElementsRef.current.delete(id)
      return
    }
    slotElementsRef.current.set(id, el)

    if (!mountedRef.current.has(id)) {
      mountedRef.current.add(id)
      el.classList.add('toast-portal__slot--entering')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.remove('toast-portal__slot--entering')
        })
      })
    }

    if (!observersRef.current.has(id)) {
      const measure = () => {
        const toast = el.querySelector('.toast')
        const h = toast ? toast.scrollHeight : el.offsetHeight
        setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }))
      }
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      observersRef.current.set(id, ro)
    }
  }, [])

  /* When a slot demotes from index 0, kill any in-flight entering
   * animation and hard-snap its current frame so the demote transition
   * starts from where the eye actually saw it. */
  useLayoutEffect(() => {
    const activeIds = slots.filter((s) => !s.leaving).map((s) => s.id)
    for (let i = 0; i < activeIds.length - 1; i++) {
      const id = activeIds[i]
      const el = slotElementsRef.current.get(id)
      if (!el) continue
      const wasEntering = el.classList.contains('toast-portal__slot--entering')
      const wasFront = lastStackIndexRef.current.get(id) === 0
      if (!wasEntering && !wasFront) continue
      el.classList.remove('toast-portal__slot--entering')
      const computed = window.getComputedStyle(el).transform
      el.style.transition = 'none'
      el.style.transform = computed === 'none' ? '' : computed
      void el.offsetHeight
      el.style.transition = ''
      el.style.transform = ''
    }
  }, [slots])

  const getRefCallback = (id) => {
    if (!refCallbacksRef.current.has(id)) {
      refCallbacksRef.current.set(id, (el) => setRef(id, el))
    }
    return refCallbacksRef.current.get(id)
  }

  const activeIds = slots.filter((s) => !s.leaving).map((s) => s.id)
  const activeCount = activeIds.length

  const h0 = heights[activeIds[activeIds.length - 1]] ?? 80
  const h1 = heights[activeIds[activeIds.length - 2]] ?? h0
  const h2 = heights[activeIds[activeIds.length - 3]] ?? h0
  const portalStyle = {
    '--h-0': `${h0}px`,
    '--h-1': `${h1}px`,
    '--h-2': `${h2}px`,
  }

  return createPortal(
    <div
      className={`toast-portal${hovered ? ' toast-portal--hovered' : ''}`}
      onMouseLeave={handlePortalLeave}
      style={portalStyle}
    >
      {slots.map((slot) => {
        const front = activeIds.indexOf(slot.id)
        let stackIndex
        if (front === -1) {
          stackIndex = lastStackIndexRef.current.get(slot.id) ?? -1
        } else {
          stackIndex = activeCount - 1 - front
          lastStackIndexRef.current.set(slot.id, stackIndex)
        }
        const slotHeight = heights[slot.id]
        const frozenMaxH = frozenMaxHeights[slot.id]
        const slotStyle =
          slotHeight !== undefined || frozenMaxH !== undefined
            ? {
                ...(slotHeight !== undefined && { '--slot-h': `${slotHeight}px` }),
                ...(frozenMaxH !== undefined && { '--frozen-max-h': `${frozenMaxH}px` }),
              }
            : undefined
        return (
          <div
            key={slot.id}
            ref={getRefCallback(slot.id)}
            className={`toast-portal__slot${
              slot.leaving
                ? slot.evicted
                  ? ' toast-portal__slot--evicted'
                  : ' toast-portal__slot--leaving'
                : ''
            }`}
            data-stack-index={stackIndex}
            style={slotStyle}
            onMouseEnter={handlePortalEnter}
          >
            <Toast
              variant={slot.variant}
              title={slot.title}
              description={slot.description}
              action={slot.action}
              mobile={slot.mobile}
              onClose={() => animateLeave(slot.id)}
              onAction={() => {
                if (slot.onAction?.() !== false) {
                  animateLeave(slot.id)
                }
              }}
            />
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
