/* Toast service — ported from the design-system source (types stripped). */

const MAX_TOASTS = 3
/* How long to wait after a dismiss before pulling the next toast off
 * the pending queue, so the leave animation can play through first. */
const QUEUE_DRAIN_DELAY_MS = 400

class ToastService {
  nextId = 0
  pendingQueue = []
  _toasts = []
  listeners = new Set()
  timers = new Map()
  paused = false

  get toasts() {
    return this._toasts
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  notify(evictedIds) {
    for (const fn of this.listeners) fn([...this._toasts], evictedIds)
  }

  show(title, description, options = {}, duration = 5000) {
    const id = this.nextId++
    const toast = {
      id,
      title,
      description,
      variant: options.variant ?? 'success',
      action: options.action,
      onAction: options.onAction,
      mobile: options.mobile,
    }

    if (this._toasts.length < MAX_TOASTS) {
      this.addToast(toast, duration)
    } else {
      this.pendingQueue.push({ toast, duration })
      this.processQueue()
    }

    return id
  }

  dismiss(id) {
    const state = this.timers.get(id)
    if (state?.timer) clearTimeout(state.timer)
    this.timers.delete(id)
    this._toasts = this._toasts.filter((t) => t.id !== id)
    this.notify()
    setTimeout(() => this.processQueue(), QUEUE_DRAIN_DELAY_MS)
  }

  /** Patch a live toast in place (retry flows: warning → loading → success). */
  update(id, patch) {
    if (!this._toasts.some((t) => t.id === id)) return

    const { duration, ...rest } = patch
    this._toasts = this._toasts.map((t) => (t.id === id ? { ...t, ...rest } : t))

    if (duration !== undefined) {
      const state = this.timers.get(id)
      if (state?.timer) clearTimeout(state.timer)
      this.timers.delete(id)
      if (duration > 0) this.scheduleDismiss(id, duration)
    }

    this.notify()
  }

  /** Pause every auto-dismiss timer (user is hovering the stack). */
  pauseAll() {
    if (this.paused) return
    this.paused = true
    const now = Date.now()
    for (const state of this.timers.values()) {
      if (state.timer) {
        clearTimeout(state.timer)
        state.timer = null
      }
      const elapsed = now - state.startedAt
      state.remaining = Math.max(0, state.remaining - elapsed)
    }
  }

  /** Resume every paused timer with its stored remaining time. */
  resumeAll() {
    if (!this.paused) return
    this.paused = false
    const now = Date.now()
    for (const [id, state] of this.timers) {
      if (state.remaining <= 0) {
        this.dismiss(id)
        continue
      }
      state.startedAt = now
      state.timer = setTimeout(() => this.dismiss(id), state.remaining)
    }
  }

  scheduleDismiss(id, duration) {
    if (duration <= 0) return
    const state = { timer: null, remaining: duration, startedAt: Date.now() }
    if (!this.paused) {
      state.timer = setTimeout(() => this.dismiss(id), duration)
    }
    this.timers.set(id, state)
  }

  addToast(toast, duration) {
    this._toasts = [...this._toasts, toast]
    this.notify()
    this.scheduleDismiss(toast.id, duration)
  }

  // Drain queued toasts, evicting the oldest in place when the visible
  // stack is full.
  processQueue() {
    if (this.pendingQueue.length === 0) return

    const evictedIds = []
    while (this.pendingQueue.length > 0) {
      if (this._toasts.length >= MAX_TOASTS) {
        const oldest = this._toasts[0]
        const state = this.timers.get(oldest.id)
        if (state?.timer) clearTimeout(state.timer)
        this.timers.delete(oldest.id)
        this._toasts = this._toasts.slice(1)
        evictedIds.push(oldest.id)
      }
      const next = this.pendingQueue.shift()
      this._toasts = [...this._toasts, next.toast]
      this.scheduleDismiss(next.toast.id, next.duration)
    }

    this.notify(evictedIds.length > 0 ? evictedIds : undefined)
  }
}

export const toastService = new ToastService()
