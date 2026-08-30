import { useEffect, useRef, useState } from 'react'

// Hidden while there's only one design — flip back on when more ship
const SHOW_GROUPS = false

function GroupChevron({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s ease',
      }}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* Routed design detail page (e.g. /toast).
 *
 * Left sidebar: profile (returns home) + collapsible category groups
 * listing every design. Center: 720px content column. Switching designs
 * slides the content vertically in list order; closing slides the page
 * out right while home enters from the left (handled in App). */
export default function DesignPage({
  item,
  index,
  all,
  groups,
  renderDetail,
  onSelect,
  onClose,
  exiting = false,
}) {
  const prevRef = useRef({ slug: item.slug, index })
  const [leaving, setLeaving] = useState(null) // { item, dir }

  // Expand the group containing the open design; others start collapsed
  const [expanded, setExpanded] = useState(() => {
    const state = {}
    for (const g of groups) {
      state[g.label] = g.items.some((d) => d.slug === item.slug)
    }
    return state
  })

  // Direction is derived at render time so the entering column carries
  // its animation class on its very first frame
  const prev = prevRef.current
  const switching = prev.slug !== item.slug
  const dir = switching ? (index > prev.index ? 1 : -1) : 0

  useEffect(() => {
    if (exiting) return
    const previous = prevRef.current
    if (previous.slug !== item.slug) {
      const d = index > previous.index ? 1 : -1
      const leavingItem = all.find((x) => x.slug === previous.slug)
      if (leavingItem) setLeaving({ item: leavingItem, dir: d })
      prevRef.current = { slug: item.slug, index }
      const t = setTimeout(() => setLeaving(null), 300)
      return () => clearTimeout(t)
    }
    prevRef.current = { slug: item.slug, index }
  }, [item, index, all, exiting])

  useEffect(() => {
    if (exiting) return
    window.scrollTo(0, 0)
    document.title = `${item.title} — Kason Calhoun`
    return () => {
      document.title = 'Kason Calhoun — Design Engineer'
    }
  }, [item, exiting])

  useEffect(() => {
    if (exiting) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, exiting])

  const toggleGroup = (label) =>
    setExpanded((s) => ({ ...s, [label]: !s[label] }))

  const heading = (d) => (
    <div className="modal-heading">
      <p className="modal-title">{d.title}</p>
      <p className="modal-year">{d.year}</p>
    </div>
  )

  const enterClass =
    switching && !exiting ? (dir === 1 ? 'detail-in-up' : 'detail-in-down') : ''

  return (
    <div className={`design-page ${exiting ? 'design-page--exiting' : ''}`}>
      <button
        type="button"
        className="page-back"
        onClick={onClose}
        aria-label="Back to designs"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </button>
      <div className="design-page-layout">
        <aside className="design-sidebar">
          <div className="sidebar-back-row">
            <button type="button" className="sidebar-back" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Design
            </button>
          </div>
          <nav
            className="design-groups"
            aria-label="Designs"
            hidden={!SHOW_GROUPS}
          >
            {groups.map((group) => (
              <div className="design-group" key={group.label}>
                <button
                  type="button"
                  className="design-group-head"
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={expanded[group.label]}
                >
                  {group.label}
                  <GroupChevron open={expanded[group.label]} />
                </button>
                <div
                  className={`design-group-items ${
                    expanded[group.label] ? 'design-group-items--open' : ''
                  }`}
                >
                  <div className="design-group-items-inner">
                    {group.items.map((d, i) => (
                      <button
                        type="button"
                        key={d.slug}
                        className={`design-group-item ${
                          d.slug === item.slug ? 'design-group-item--active' : ''
                        }`}
                        style={{ '--i': i }}
                        onClick={() => onSelect(d)}
                        tabIndex={expanded[group.label] ? 0 : -1}
                      >
                        {d.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <div className="design-page-wrap">
          <main key={item.slug} className={`design-page-main ${enterClass}`}>
            <div className="detail-head">
              {heading(item)}
              <div className="design-nav">
                <button
                  type="button"
                  className="nav-btn"
                  aria-label="Previous design"
                  disabled={index === 0}
                  onClick={() => onSelect(all[index - 1])}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="nav-btn"
                  aria-label="Next design"
                  disabled={index === all.length - 1}
                  onClick={() => onSelect(all[index + 1])}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            {renderDetail(item)}
          </main>
          {leaving && (
            <div
              className={`design-page-main detail-leaving ${
                leaving.dir === 1 ? 'detail-out-up' : 'detail-out-down'
              }`}
              aria-hidden="true"
            >
              {heading(leaving.item)}
              {renderDetail(leaving.item)}
            </div>
          )}
        </div>
        <div className="design-page-spacer" aria-hidden="true" />
      </div>
    </div>
  )
}
