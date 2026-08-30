import { useEffect, useRef, useState } from 'react'
import Toast from './Toast'
import { ToastContainer } from './ToastContainer'
import { toastService } from './toast-service'

const COPY = {
  loading: {
    title: 'Updating password…',
    description: 'Hang tight, this only takes a second.',
  },
  success: {
    title: 'Success',
    description: 'Your password has been updated.',
  },
}

/* Pending → success, looping forever: shows the icon morph without
   any input. */
const TOUR = [
  { variant: 'loading', ms: 1800 },
  { variant: 'success', ms: 2600 },
]

/* id 0 is the resting back toast, id 1 the resting middle one (long,
   multi-line — its capped height shows the max-height behavior), and
   ids ≥ 2 rotate through as the incoming front toast. */
const FRONT_MESSAGES = [
  'Your password has been updated.',
  'Settings synced.',
  'Invite sent to alex@team.com.',
]

function stackCopy(id) {
  if (id === 0) return 'Draft saved.'
  if (id === 1)
    return 'Your report finished exporting. We saved a copy to your workspace so you can share it with your team anytime.'
  return FRONT_MESSAGES[id % FRONT_MESSAGES.length]
}

function CursorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.36-4.36a.5.5 0 0 1 .35-.15h6.16a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z"
        fill="#000"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* Scripted stack demo: a new toast pushes into the front of the stack,
   a simulated cursor moves in (the stack expands on "hover"), clicks
   the X on the newly added toast to dismiss it, then the stack
   collapses — looping forever with the portal's real geometry. */
export function StackShowcase() {
  const [stack, setStack] = useState([0, 1])
  const [heights, setHeights] = useState({})
  const [entering, setEntering] = useState(null)
  const [leaving, setLeaving] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [cursorPos, setCursorPos] = useState('away') // away | center | x
  const [clicking, setClicking] = useState(false)
  const stackRef = useRef([0, 1])
  const nextId = useRef(2)
  const slotRefs = useRef(new Map())

  // Measure each toast's natural height (scrollHeight ignores the
  // max-height cap) so the stack math works with mixed heights
  useEffect(() => {
    const next = {}
    for (const [id, el] of slotRefs.current) {
      const toastEl = el?.querySelector('.toast')
      if (toastEl) next[id] = toastEl.scrollHeight
    }
    setHeights((prev) => {
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.keys(next).every((k) => next[k] === prev[k])
      return same ? prev : next
    })
  }, [stack])

  useEffect(() => {
    const timers = []
    const at = (ms, fn) => timers.push(setTimeout(fn, ms))
    const updateStack = (fn) => {
      stackRef.current = fn(stackRef.current)
      setStack(stackRef.current)
    }
    const cycle = () => {
      at(1000, () => {
        const id = nextId.current++
        setEntering(id)
        updateStack((s) => [...s, id])
        requestAnimationFrame(() => requestAnimationFrame(() => setEntering(null)))
      })
      // Cursor moves to the center of the stack, which expands it…
      at(2400, () => setCursorPos('center'))
      at(2950, () => setHovered(true))
      // …then over to the X on the newest (front) toast, and clicks
      at(4400, () => setCursorPos('x'))
      at(5300, () => setClicking(true))
      at(5450, () => setClicking(false))
      at(5500, () => setLeaving(stackRef.current[stackRef.current.length - 1]))
      at(6050, () => {
        updateStack((s) => s.slice(0, -1))
        setLeaving(null)
      })
      at(7000, () => {
        setCursorPos('away')
        setHovered(false)
      })
      at(8600, cycle)
    }
    cycle()
    return () => timers.forEach(clearTimeout)
  }, [])

  const front = stack[stack.length - 1]
  const middle = stack[stack.length - 2]
  const containerVars = {
    '--h-0': `${heights[front] ?? 82}px`,
    '--h-1': `${heights[middle] ?? 82}px`,
  }

  const cursorCls = [
    'demo-cursor',
    cursorPos === 'center' && 'demo-cursor--center',
    cursorPos === 'x' && 'demo-cursor--x',
    clicking && 'demo-cursor--click',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="toast-stage" aria-hidden="true">
      <div
        className={`stack-demo ${hovered ? 'stack-demo--hovered' : ''}`}
        style={containerVars}
      >
      {stack.map((id, i) => {
        const idx = stack.length - 1 - i
        const cls = [
          'stack-demo__slot',
          entering === id && 'stack-demo__slot--entering',
          leaving === id && 'stack-demo__slot--leaving',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div
            key={id}
            ref={(el) => {
              if (el) slotRefs.current.set(id, el)
              else slotRefs.current.delete(id)
            }}
            className={cls}
            data-stack-index={idx}
            style={{ '--slot-h': `${heights[id] ?? 82}px` }}
          >
            <Toast variant="success" title="Success" description={stackCopy(id)} />
          </div>
        )
      })}
      <div className={cursorCls}>
        <CursorIcon />
      </div>
      </div>
    </div>
  )
}

/* The single morphing toast: loading → success on a loop */
export function MorphShowcase() {
  const [variant, setVariant] = useState('loading')
  const tourTimer = useRef(null)
  const stepRef = useRef(0)

  useEffect(() => {
    const advance = () => {
      const step = TOUR[stepRef.current % TOUR.length]
      tourTimer.current = setTimeout(() => {
        stepRef.current += 1
        setVariant(TOUR[stepRef.current % TOUR.length].variant)
        advance()
      }, step.ms)
    }
    advance()
    return () => clearTimeout(tourTimer.current)
  }, [])

  const copy = COPY[variant]

  return (
    <div className="toast-stage" aria-hidden="true">
      {/* Fixed-height slot so state changes don't shift the layout */}
      <div className="toast-slot">
        <Toast variant={variant} title={copy.title} description={copy.description} />
      </div>
    </div>
  )
}

/* Mobile variant: title-only pill with a backdrop blur, floating over a
   colorful surface so the blur is visible. Enters, rests, and dismisses
   on a loop. */
export function MobileShowcase() {
  return (
    <div className="toast-stage" aria-hidden="true">
      <div className="mobile-stage">
        <div className="mobile-toast-wrap">
          <Toast
            mobile
            variant="success"
            title="Restock notifications enabled"
            description="You’ll be emailed when this item is back in stock."
          />
        </div>
      </div>
    </div>
  )
}

/* Interactive playground: fires real toasts through the real service
   into the real portal at the bottom left of the screen. */
export function ToastPlayground() {
  // Clear any live toasts when the modal closes
  useEffect(
    () => () => {
      toastService.toasts.forEach((t) => toastService.dismiss(t.id))
    },
    [],
  )

  const fireRetryFlow = () => {
    const id = toastService.show('Connection lost', 'We couldn’t reach the server.', {
      variant: 'warning',
      action: 'Retry',
      onAction: () => {
        toastService.update(id, {
          variant: 'loading',
          title: 'Retrying',
          description: 'Reconnecting to the server…',
          action: undefined,
          onAction: undefined,
          duration: 0,
        })
        setTimeout(() => {
          toastService.update(id, {
            variant: 'success',
            title: 'Reconnected',
            description: 'You’re back online.',
            duration: 3000,
          })
        }, 2000)
        return false
      },
    })
  }

  return (
    <div className="demo-controls">
      <button
        className="demo-pill"
        onClick={() =>
          toastService.show('Success', 'Your action was completed.', {
            variant: 'success',
          })
        }
      >
        Success
      </button>
      <button
        className="demo-pill"
        onClick={() =>
          toastService.show('Item deleted', 'The item was removed from your list.', {
            variant: 'error',
            action: 'Undo',
          })
        }
      >
        Error + Undo
      </button>
      <button className="demo-pill" onClick={fireRetryFlow}>
        Warning + Retry
      </button>
      <button
        className="demo-pill"
        onClick={() =>
          toastService.show('Uploading', 'Your file is being uploaded.', {
            variant: 'loading',
          })
        }
      >
        Loading
      </button>
      <button
        className="demo-pill"
        onClick={() =>
          toastService.show(
            'Long description',
            'This description wraps to two or three lines and pushes the toast taller, so you can see how the stack handles mixed heights.',
            { variant: 'success', action: 'Got it' },
          )
        }
      >
        Tall toast
      </button>
      <ToastContainer />
    </div>
  )
}
