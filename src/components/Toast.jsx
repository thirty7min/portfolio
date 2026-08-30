import { useEffect, useRef, useState } from 'react'
import './Toast.css'

/* How long to keep the previous-variant icon mounted so its leave
 * animation can play out. Spinner gets a shorter exit because it's
 * an actively-spinning element — letting it linger reads as "still
 * loading"; clearing it sooner makes the success pop land cleaner. */
const ICON_LEAVE_MS = 130
const ICON_LEAVE_LOADING_MS = 90

const VARIANT_COLORS = {
  success: '#00A354',
  error: '#ED0600',
  warning: '#EDB600',
}

function CheckCircleIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CircleXIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function TriangleAlertIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="toast-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const VARIANT_ICONS = {
  success: CheckCircleIcon,
  error: CircleXIcon,
  warning: TriangleAlertIcon,
}

function renderVariantIcon(variant) {
  if (variant === 'loading') return <Spinner />
  const IconComponent = VARIANT_ICONS[variant]
  return <IconComponent color={VARIANT_COLORS[variant]} />
}

export default function Toast({
  variant,
  title,
  description,
  action,
  onAction,
  onClose,
  hideIcon = false,
  mobile = false,
  className,
}) {
  /* When `variant` changes (e.g. warning → loading → success during a
   * retry flow) keep the previous icon mounted for one animation cycle
   * so it can scale down + fade out while the new icon scales up +
   * fades in. `enterToken` stays 0 on initial mount so the first icon
   * renders statically. */
  const prevVariantRef = useRef(variant)
  const [previousVariant, setPreviousVariant] = useState(null)
  const [enterToken, setEnterToken] = useState(0)

  useEffect(() => {
    if (prevVariantRef.current === variant) return
    const leaving = prevVariantRef.current
    setPreviousVariant(leaving)
    setEnterToken((t) => t + 1)
    prevVariantRef.current = variant
    const ms = leaving === 'loading' ? ICON_LEAVE_LOADING_MS : ICON_LEAVE_MS
    const t = window.setTimeout(() => setPreviousVariant(null), ms)
    return () => window.clearTimeout(t)
  }, [variant])

  const cls = [
    'toast',
    `toast--${variant}`,
    mobile && 'toast--mobile',
    hideIcon && 'toast--no-icon',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} role="alert">
      <div className="toast__body">
        {!hideIcon && (
          <div className="toast__icon">
            {previousVariant !== null && previousVariant !== variant && (
              <span
                key={`leave-${previousVariant}`}
                className={`toast__icon-layer toast__icon-layer--leaving toast__icon-layer--leaving-${previousVariant}`}
              >
                {renderVariantIcon(previousVariant)}
              </span>
            )}
            <span
              key={enterToken === 0 ? 'initial' : `enter-${enterToken}`}
              className={`toast__icon-layer${enterToken > 0 ? ' toast__icon-layer--entering' : ''}`}
            >
              {renderVariantIcon(variant)}
            </span>
          </div>
        )}
        <div className="toast__content">
          <div className="toast__title">{title}</div>
          {description && <div className="toast__description">{description}</div>}
          {action && (
            <button type="button" className="toast__action" onClick={() => onAction?.()}>
              {action}
            </button>
          )}
        </div>
      </div>
      <div className="toast__close-area">
        <button type="button" className="toast__close" onClick={() => onClose?.()} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
