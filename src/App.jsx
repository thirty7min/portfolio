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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14.6666 5.02335V11.3333C14.6666 11.8435 14.4717 12.3344 14.1217 12.7055C13.7718 13.0767 13.2932 13.3001 12.7839 13.33L12.6666 13.3333H3.33325C2.82311 13.3334 2.33224 13.1385 1.96108 12.7885C1.58991 12.4385 1.36651 11.9599 1.33659 11.4507L1.33325 11.3333V5.02335L7.62992 9.22135L7.70725 9.26535C7.79839 9.30988 7.89849 9.33302 7.99992 9.33302C8.10135 9.33302 8.20145 9.30988 8.29259 9.26535L8.36992 9.22135L14.6666 5.02335Z"
        fill="#222222"
        fillOpacity="0.8"
      />
      <path
        d="M12.6666 2.66666C13.3866 2.66666 14.0179 3.04666 14.3699 3.61799L7.99988 7.86466L1.62988 3.61799C1.79704 3.3465 2.02669 3.11892 2.29969 2.95424C2.57268 2.78957 2.8811 2.69256 3.19922 2.67132L3.33322 2.66666H12.6666Z"
        fill="#222222"
        fillOpacity="0.8"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip0_3_2506)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.55556 15H13.4444C14.3036 15 15 14.3036 15 13.4444V2.55556C15 1.69645 14.3036 1 13.4444 1H2.55556C1.69645 1 1 1.69645 1 2.55556V13.4444C1 14.3036 1.69645 15 2.55556 15Z"
          fill="#222222"
          fillOpacity="0.8"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.0554 13.0556H10.9779V9.51709C10.9779 8.54694 10.6093 8.00478 9.84142 8.00478C9.00607 8.00478 8.56963 8.56898 8.56963 9.51709V13.0556H6.56748V6.31483H8.56963V7.22281C8.56963 7.22281 9.17162 6.10889 10.6021 6.10889C12.0318 6.10889 13.0554 6.98199 13.0554 8.78775V13.0556ZM4.17893 5.43218C3.49696 5.43218 2.94434 4.87522 2.94434 4.18832C2.94434 3.50142 3.49696 2.94446 4.17893 2.94446C4.8609 2.94446 5.4132 3.50142 5.4132 4.18832C5.4132 4.87522 4.8609 5.43218 4.17893 5.43218ZM3.14511 13.0556H5.23283V6.31483H3.14511V13.0556Z"
          fill="#E9E9EA"
        />
      </g>
      <defs>
        <clipPath id="clip0_3_2506">
          <rect width="14" height="14" fill="white" transform="translate(1 1)" />
        </clipPath>
      </defs>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip0_3_2513)">
        <path
          d="M12.0134 1.67667H14.1601L9.44673 7.04333L14.9534 14.3233H10.6321L7.24873 9.89933L3.3754 14.3233H1.22873L6.22206 8.58333L0.94873 1.67667H5.3774L8.43406 5.718L12.0134 1.67667ZM11.2621 13.0633H12.4521L4.75206 2.89H3.4734L11.2621 13.0633Z"
          fill="#222222"
          fillOpacity="0.8"
        />
      </g>
      <defs>
        <clipPath id="clip0_3_2513">
          <rect width="14" height="12.6467" fill="white" transform="translate(1 1.67667)" />
        </clipPath>
      </defs>
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
    <section className="section contact">
      <p className="section-body">
        I&rsquo;m open to work opportunities, collaborations, or just a good
        chat about product and design. Feel free to reach out at any time,
        I&rsquo;m active on all of the below.
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
        Based in Northern Virginia, where it&rsquo;s {easternTime}.
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
