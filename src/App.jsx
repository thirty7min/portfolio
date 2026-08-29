import { useEffect, useRef, useState } from 'react'
import avatar from './assets/avatar.png'
import designTaskTracker from './assets/design-task-tracker.png'
import designSignIn from './assets/design-sign-in.png'
import designDashboard from './assets/design-dashboard.png'
import './App.css'

const TABS = ['About', 'Designs', 'Contact']

const PRODUCT_DESIGNS = [
  { title: 'Task tracker', year: '2026', image: designTaskTracker },
  { title: 'Sign in', year: '2026', image: designSignIn },
  { title: 'Dashboard design', year: '2026', image: designDashboard },
  { title: 'Task tracker', year: '2026', image: designTaskTracker },
  { title: 'Sign in', year: '2026', image: designSignIn },
]

const COMPONENT_DESIGNS = [
  { title: 'Dashboard design', year: '2026', image: designTaskTracker },
  { title: 'Dashboard design', year: '2026', image: designTaskTracker },
  { title: 'Sign in', year: '2026', image: designSignIn },
  { title: 'Dashboard design', year: '2026', image: designDashboard },
]

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DesignRow({ label, count, items }) {
  const scrollerRef = useRef(null)
  const targetRef = useRef(null) // pending smooth-scroll destination
  const settleRef = useRef(null)
  // Buttons flip immediately from a click's destination; the fade masks
  // track the real scroll position so cards never slide past them unfaded
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [fadeLeft, setFadeLeft] = useState(false)
  const [fadeRight, setFadeRight] = useState(true)

  const setButtons = (pos, max) => {
    setCanLeft(pos > 2)
    setCanRight(pos < max - 2)
  }

  const updateEdges = () => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pos = el.scrollLeft
    setFadeLeft(pos > 2)
    setFadeRight(pos < max - 2)
    let btnPos = pos
    if (targetRef.current != null) {
      if (Math.abs(pos - targetRef.current) < 2) {
        targetRef.current = null
      } else {
        btnPos = targetRef.current
      }
    }
    setButtons(btnPos, max)
  }

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => {
      window.removeEventListener('resize', updateEdges)
      clearTimeout(settleRef.current)
    }
  }, [])

  const scrollBy = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    const amount = 370 // 350 card + 20 gap
    const max = el.scrollWidth - el.clientWidth
    const base = targetRef.current ?? el.scrollLeft
    const target = Math.max(0, Math.min(base + dir * amount, max))
    targetRef.current = target
    el.scrollTo({ left: target, behavior: 'smooth' })
    // Reflect the destination immediately so buttons disable without delay
    setButtons(target, max)
    // Failsafe: if the animation is interrupted or snap lands off-target,
    // re-sync from the real position once things settle
    clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => {
      targetRef.current = null
      updateEdges()
    }, 700)
  }

  return (
    <div className="design-row">
      <div className="design-row-head">
        <p className="design-row-title">
          {label} ({count})
        </p>
        <div className="design-nav">
          <button
            className="nav-btn"
            aria-label={`Scroll ${label} left`}
            disabled={!canLeft}
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeft />
          </button>
          <button
            className="nav-btn"
            aria-label={`Scroll ${label} right`}
            disabled={!canRight}
            onClick={() => scrollBy(1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <div
        className={`design-scroller ${fadeLeft ? 'fade-left' : ''} ${fadeRight ? 'fade-right' : ''}`}
        ref={scrollerRef}
        onScroll={updateEdges}
      >
        <div className="design-track">
          {items.map((item, i) => (
            <figure className="design-card" key={`${item.title}-${i}`}>
              <div className="design-preview">
                <img src={item.image} alt={`${item.title} preview`} />
              </div>
              <figcaption className="design-meta">
                <p className="design-title">{item.title}</p>
                <p className="design-year">{item.year}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <>
      <section className="section">
        <h2 className="section-title">About me</h2>
        <p className="section-body">
          I currently lead design and digital products at
          MobileSentrix, a B2B e-commerce company. Although my primary role is
          managing product, I enjoy getting my hands dirty with product and
          interaction design. Being able to own a product from it&rsquo;s
          function to it&rsquo;s looks is an incredible opportunity.
        </p>
        <p className="section-body">
          I grew up in the DC area and have lived in Virginia all of my life.
          I&rsquo;ve been a creative ever since I was young, and would doodle
          all over my school books, mom was not a fan.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Experience</h2>
        <p className="section-body">
          I have been designing web products in the e-commerce industry for 3
          years now. While my expertise is with e-commerce products, I love
          tech products and making my own products in my free time.
        </p>
        <p className="section-body">
          I have used Figma as my design tool since I have been designing
          product, and as of this year, have been turning designs into code
          with Figma&rsquo;s MCP server. This has been game changing for me as
          it allows me to fine tune designs based on how a user actually
          interacts with it, and also allows me to make smooth animations and
          interactions with the UI.
        </p>
        <p className="section-body">
          My workflow is creating a complete design in Figma, turning it into
          code with Claude Code, and then fine-tuning design and interaction
          animations in the code base.
        </p>
      </section>
    </>
  )
}

function DesignsSection() {
  return (
    <div className="designs">
      <DesignRow
        label="Product design"
        count={PRODUCT_DESIGNS.length}
        items={PRODUCT_DESIGNS}
      />
      <DesignRow
        label="Component design"
        count={COMPONENT_DESIGNS.length}
        items={COMPONENT_DESIGNS}
      />
    </div>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 7L12 13L20.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.17V23H8V8z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  )
}

const CONTACT_LINKS = [
  {
    label: 'Email',
    handle: 'kasonecal@gmail.com',
    href: 'mailto:kasonecal@gmail.com',
    icon: <MailIcon />,
  },
  {
    label: 'LinkedIn',
    handle: '/in/kason-calhoun',
    href: 'https://www.linkedin.com/in/kason-calhoun',
    icon: <LinkedInIcon />,
  },
  {
    label: 'X',
    handle: '@kasoncal',
    href: 'https://x.com/kasoncal',
    icon: <XIcon />,
  },
]

function useEasternTime() {
  const format = () =>
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    }).format(new Date())

  const [time, setTime] = useState(format)

  useEffect(() => {
    const tick = setInterval(() => setTime(format()), 1000)
    return () => clearInterval(tick)
  }, [])

  return time
}

function ContactSection() {
  const easternTime = useEasternTime()

  return (
    <section className="section">
      <p className="section-body">
        I&rsquo;m open to work opportunities, collaborations, or just a good
        chat about product and design. Reach out anytime — email is fastest,
        but I&rsquo;m around on all of these:
      </p>
      <div className="contact-links">
        {CONTACT_LINKS.map((link) => (
          <a
            key={link.label}
            className="contact-link"
            href={link.href}
            target={link.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noreferrer"
          >
            <span className="contact-icon">{link.icon}</span>
            <span className="contact-handle">{link.handle}</span>
          </a>
        ))}
      </div>
      <p className="contact-location">
        Based in Northern Virginia, where it&rsquo;s {easternTime}
      </p>
    </section>
  )
}

const LEAVE_MS = 200 // matches .content-out-* duration

function renderSection(tab) {
  if (tab === 'About') return <AboutSection />
  if (tab === 'Designs') return <DesignsSection />
  return <ContactSection />
}

export default function App() {
  const [active, setActive] = useState('About')
  const [leaving, setLeaving] = useState(null) // { tab, dir } — old view fading out
  const [enterDir, setEnterDir] = useState(0) // direction of the last switch
  const [firstLoad, setFirstLoad] = useState(true) // waterfall entrance runs once
  const switchTimer = useRef(null)

  useEffect(() => () => clearTimeout(switchTimer.current), [])

  const switchTab = (tab) => {
    if (tab === active) return
    const dir = TABS.indexOf(tab) > TABS.indexOf(active) ? 1 : -1
    setFirstLoad(false)
    setLeaving({ tab: active, dir })
    setEnterDir(dir)
    setActive(tab)
    clearTimeout(switchTimer.current)
    switchTimer.current = setTimeout(() => setLeaving(null), LEAVE_MS)
  }

  return (
    <div className="page">
      <div className={`column ${firstLoad ? 'first-load' : ''}`}>
        <header className="profile">
          <div className="avatar">
            <img src={avatar} alt="Kason Calhoun" />
          </div>
          <div className="identity">
            <p className="name">Kason Calhoun</p>
            <p className="role">Design Engineer</p>
          </div>
        </header>

        <nav className="tabs" role="tablist" aria-label="Sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={active === tab}
              className={`tab ${active === tab ? 'tab-active' : ''}`}
              onClick={() => switchTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main className="content-wrap">
          <div
            key={active}
            className={`content ${
              enterDir === 1
                ? 'content-in-right'
                : enterDir === -1
                  ? 'content-in-left'
                  : ''
            }`}
          >
            {renderSection(active)}
          </div>
          {leaving && (
            <div
              key={`leaving-${leaving.tab}`}
              className={`content content-leaving ${
                leaving.dir === 1 ? 'content-out-left' : 'content-out-right'
              }`}
              aria-hidden="true"
            >
              {renderSection(leaving.tab)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
