import { useState, useEffect, useRef } from "react";
// Add this at the top of HomePage.jsx with the other imports
import logo from '../assets/stylzap-logo.png';

const COLORS = {
  bg: "#0A0A0A",
  surface: "#111111",
  surface2: "#181818",
  border: "#1E1E1E",
  borderBright: "#2A2A2A",
  accent: "#9333EA",
  accentDim: "#7B2FBE",
  accentGlow: "rgba(147,51,234,0.12)",
  accentGlow2: "rgba(147,51,234,0.06)",
  text: "#F0F0F0",
  textMuted: "#888888",
  textDim: "#555555",
  gold: "#E8C547",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: ${COLORS.accent};
    --bg: ${COLORS.bg};
    --surface: ${COLORS.surface};
    --surface2: ${COLORS.surface2};
    --border: ${COLORS.border};
    --text: ${COLORS.text};
    --muted: ${COLORS.textMuted};
  }

  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  h1, h2, h3, h4, .display { font-family: 'Syne', sans-serif; }

  ::selection { background: rgba(147,51,234,0.3); }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0A0A0A; }
  ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes scanline {
    0% { top: -10%; }
    100% { top: 110%; }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .nav-link { color: ${COLORS.textMuted}; text-decoration: none; font-size: 14px; font-weight: 400; letter-spacing: 0.01em; transition: color 0.2s; cursor: pointer; }
  .nav-link:hover { color: ${COLORS.text}; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${COLORS.accent}; color: #ffffff; border: none;
    padding: 13px 28px; border-radius: 6px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em;
    text-decoration: none; white-space: nowrap;
  }
  .btn-primary:hover { background: #a855f7; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: ${COLORS.textMuted}; 
    border: 1px solid ${COLORS.border};
    padding: 12px 28px; border-radius: 6px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400;
    cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em;
    text-decoration: none; white-space: nowrap;
  }
  .btn-ghost:hover { border-color: ${COLORS.borderBright}; color: ${COLORS.text}; }

  .section-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.2);
    color: ${COLORS.accent}; font-size: 11px; font-weight: 500;
    padding: 5px 12px; border-radius: 999px; letter-spacing: 0.08em; text-transform: uppercase;
  }

  .feature-card {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 12px; padding: 28px; position: relative;
    transition: border-color 0.3s, transform 0.3s;
    overflow: hidden;
  }
  .feature-card:hover { border-color: rgba(37,211,102,0.3); transform: translateY(-2px); }
  .feature-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 12px;
    background: radial-gradient(circle at top left, rgba(37,211,102,0.06) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.3s;
  }
  .feature-card:hover::before { opacity: 1; }

  .price-card {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 14px; padding: 32px 28px; position: relative;
    transition: border-color 0.3s, transform 0.3s; overflow: hidden;
  }
  .price-card.featured {
    border-color: rgba(37,211,102,0.5);
    background: linear-gradient(145deg, rgba(37,211,102,0.06) 0%, ${COLORS.surface} 60%);
  }
  .price-card:hover { transform: translateY(-3px); }

  .check-item {
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; color: ${COLORS.textMuted}; padding: 6px 0;
  }
  .check-item .dot { 
    width: 18px; height: 18px; border-radius: 50%;
    background: rgba(37,211,102,0.12); display: flex; align-items: center;
    justify-content: center; flex-shrink: 0;
  }
  .check-item .dot svg { width: 10px; height: 10px; }

  .stat-pill {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 10px; padding: 20px 24px; text-align: center;
  }

  .step-line {
    position: absolute; left: 19px; top: 44px; bottom: -44px;
    width: 1px; background: linear-gradient(to bottom, ${COLORS.border} 0%, transparent 100%);
  }

  .wa-bubble-out {
    background: rgba(147,51,234,0.15); border: 1px solid rgba(147,51,234,0.2);
    border-radius: 12px 12px 2px 12px; padding: 10px 14px;
    font-size: 13px; color: ${COLORS.text}; max-width: 200px; margin-left: auto;
  }
  .wa-bubble-in {
    background: ${COLORS.surface2}; border: 1px solid ${COLORS.border};
    border-radius: 12px 12px 12px 2px; padding: 10px 14px;
    font-size: 13px; color: ${COLORS.text}; max-width: 220px;
  }

  .testimonial-card {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 14px; padding: 28px; transition: border-color 0.3s;
  }
  .testimonial-card:hover { border-color: ${COLORS.borderBright}; }

  .faq-item {
    border-bottom: 1px solid ${COLORS.border}; overflow: hidden;
  }
  .faq-question {
    width: 100%; background: transparent; border: none; padding: 20px 0;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    cursor: pointer; text-align: left; font-family: 'DM Sans', sans-serif;
    font-size: 16px; font-weight: 500; color: ${COLORS.text};
  }
  .faq-answer {
    font-size: 15px; line-height: 1.7; color: ${COLORS.textMuted};
    max-height: 0; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease;
  }
  .faq-answer.open { max-height: 300px; padding-bottom: 20px; }

  .ticker-wrap { overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-flex; gap: 0; animation: ticker 30s linear infinite; }
  .ticker-item {
    display: inline-flex; align-items: center; gap: 12px;
    padding: 0 32px; font-size: 13px; color: ${COLORS.textDim};
    font-weight: 400; letter-spacing: 0.02em;
  }
  .ticker-dot { width: 3px; height: 3px; border-radius: 50%; background: ${COLORS.borderBright}; }

  .glow-line {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(37,211,102,0.4), transparent);
  }

  input[type=email] {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 6px; padding: 13px 16px; color: ${COLORS.text};
    font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none;
    transition: border-color 0.2s; width: 100%;
  }
  input[type=email]::placeholder { color: ${COLORS.textDim}; }
  input[type=email]:focus { border-color: rgba(37,211,102,0.4); }

  .animate-in { animation: fadeUp 0.6s ease both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }
`;

const WhatsAppMockup = () => (
  <div style={{
    background: COLORS.surface2, borderRadius: 20, border: `1px solid ${COLORS.border}`,
    overflow: "hidden", width: 280, boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
    animation: "float 4s ease-in-out infinite",
    position: "relative",
  }}>
    <div style={{ background: "#6b21a8", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>StylZap Bot</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Online</div>
      </div>
    </div>
    <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="wa-bubble-in">👋 Hi Rahul! Send me a selfie and I'll suggest the perfect hairstyle for you.</div>
      <div className="wa-bubble-out">📸 [selfie.jpg]</div>
      <div className="wa-bubble-in">
        <div style={{ marginBottom: 6 }}>✨ Based on your <strong style={{ color: "#a855f7" }}>oval face shape</strong>, here are your top picks:</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>1. High Fade Quiff<br />2. Textured French Crop<br />3. Classic Pompadour</div>
      </div>
      <div className="wa-bubble-out">Go with option 1!</div>
      <div className="wa-bubble-in">
        🎨 Here's your AI preview:<br />
        <div style={{ marginTop: 8, background: COLORS.border, borderRadius: 8, height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: COLORS.textDim }}>AI generated image</span>
        </div>
      </div>
    </div>
    <div style={{ padding: "10px 12px 14px", borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: COLORS.border, borderRadius: 20, height: 36, display: "flex", alignItems: "center", paddingLeft: 14 }}>
        <span style={{ fontSize: 12, color: COLORS.textDim }}>Type a message...</span>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </div>
    </div>
  </div>
);

const features = [
  { icon: "ti-camera-selfie", title: "AI Hairstyle Preview", desc: "Customer sends a selfie on WhatsApp. AI analyses face shape and generates a photorealistic 3-panel preview — front, side, back." },
  { icon: "ti-brand-whatsapp", title: "WhatsApp Native", desc: "Zero app downloads. Customers interact on WhatsApp they already use. AI bot handles queries 24×7 in Hindi & English." },
  { icon: "ti-calendar-event", title: "Smart Booking", desc: "Slot-based bookings with stylist assignment, availability awareness, and instant WhatsApp confirmation." },
  { icon: "ti-bell-ringing", title: "Auto Reminders", desc: "WhatsApp reminders 2 hours before every appointment. Reduce no-shows without any manual effort." },
  { icon: "ti-chart-bar", title: "Revenue Dashboard", desc: "Live bookings feed with WebSocket updates. New booking sound alert. Earnings breakdown by day and stylist." },
  { icon: "ti-sparkles", title: "Celebrity Styles", desc: "Customers pick inspiration from celebrity hairstyles. AI maps it to their face shape and generates a personalised preview." },
];

const steps = [
  { num: "01", title: "Customer sends selfie", desc: "On WhatsApp — no app, no signup, just a message." },
  { num: "02", title: "AI analyses face shape", desc: "Claude detects oval, round, square, heart, or oblong — then curates perfect styles." },
  { num: "03", title: "AI generates preview", desc: "Nano Banana 2 renders a 3-panel image: front, side profile, and neckline back — all in 30 seconds." },
  { num: "04", title: "Customer books the look", desc: "One tap to book the appointment via WhatsApp. Slot confirmed instantly." },
];

const plans = [
  {
    name: "Starter", price: "₹999", period: "/month", setup: "₹2,999 one-time setup",
    desc: "Perfect for solo stylists",
    credits: "50 AI credits/month",
    features: ["Smart booking page", "WhatsApp reminders", "Basic dashboard", "AI style recommender", "Extra images ₹10/each"],
    featured: false, cta: "Start free trial",
  },
  {
    name: "Growth", price: "₹1,999", period: "/month", setup: "₹2,999 one-time setup",
    desc: "For salons ready to scale",
    credits: "150 AI credits/month",
    features: ["Everything in Starter", "WhatsApp AI bot 24/7", "Celebrity style matching", "Revenue insights", "Priority support"],
    featured: true, cta: "Get Growth",
  },
  {
    name: "Pro", price: "₹2,999", period: "/month", setup: "₹2,999 one-time setup",
    desc: "For multi-branch salons",
    credits: "300 AI credits/month",
    features: ["Everything in Growth", "Multi-branch management", "Staff assignment", "Broadcast campaigns", "Dedicated onboarding"],
    featured: false, cta: "Get Pro",
  },
];

const testimonials = [
  {
    quote: "My clients go crazy for the AI preview. They come in knowing exactly what they want — zero back-and-forth. Bookings up 60% in two months.",
    name: "Priya Sharma", role: "Owner, Glamour Studio", city: "Bengaluru", initials: "PS",
  },
  {
    quote: "No-shows dropped from 8 a week to maybe 1. The WhatsApp reminders are automatic and the booking page is cleaner than anything I could build.",
    name: "Arjun Mehta", role: "Head Stylist & Owner", city: "Mumbai", initials: "AM",
  },
  {
    quote: "Setup took literally 5 minutes. Now my customers book at midnight, get a reminder in the morning, and walk in on time. It runs itself.",
    name: "Karthik Reddy", role: "Founder, The Cut", city: "Hyderabad", initials: "KR",
  },
];

const faqs = [
  { q: "Do my customers need to download any app?", a: "No. Everything runs on WhatsApp — which your customers already have. There is no app to download, no account to create. They just send a message." },
  { q: "How does AI image generation work?", a: "The customer sends a selfie via WhatsApp. Our AI (Claude) analyses their face shape, recommends hairstyles suited to them, and then generates a photorealistic 3-panel preview using Nano Banana 2. The whole process takes under 30 seconds." },
  { q: "What is an AI credit?", a: "Each AI hairstyle preview consumes 1 credit. Your plan comes with a fixed monthly allocation — Starter gets 50, Growth gets 150, Pro gets 300. Extra images are available at ₹10 each. Credits reset on your billing date." },
  { q: "Who pays for WhatsApp messages?", a: "Your salon pays Meta directly for outgoing WhatsApp Business messages at ₹0.115 per message — standard Meta pricing. StylZap handles the API integration; we do not mark up the messaging cost." },
  { q: "Can I try before committing?", a: "Yes — start a 14-day free trial with no credit card needed. The ₹2,999 one-time setup fee applies when you move to a paid plan, not during the trial." },
  { q: "Is my customer data safe?", a: "All data is stored in encrypted PostgreSQL databases. We never sell or share customer data. Photos sent for AI preview are processed and not stored beyond the session." },
];

const tickerItems = [
  "AI Hairstyle Preview", "WhatsApp Booking", "Auto Reminders", "Face Shape Analysis",
  "Revenue Dashboard", "Celebrity Styles", "Smart Slots", "Instant Confirmation",
  "24×7 AI Bot", "Multi-stylist Support",
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTrial = async () => {
  if (!email || !email.includes('@')) return;
  if (!phone || phone.length < 10) return;
  try {
    await fetch('https://api.stylzap.com/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone }),
    });
    setSubmitted(true);
  } catch (err) {
    console.error(err);
    setSubmitted(true);
  }
};

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.border}` : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="StylZap" style={{ height: 36, width: "auto", objectFit: "contain" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[["Features", "features"], ["How it works", "how-it-works"], ["Pricing", "pricing"], ["FAQ", "faq"]].map(([label, id]) => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)} style={{ background: "none", border: "none", cursor: "pointer" }}>{label}</button>
            ))}
          </div>
          <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }} onClick={() => scrollTo("cta")}>Start free trial ↗</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 80 }}>
        {/* background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        {/* accent radial */}
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800,
          background: "radial-gradient(circle, rgba(37,211,102,0.07) 0%, transparent 65%)",
          zIndex: 0,
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", display: "flex", alignItems: "center", gap: 80, position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ flex: 1 }}>
            <div className="section-tag animate-in" style={{ marginBottom: 24 }}>
              <i className="ti ti-brand-whatsapp" aria-hidden="true" />
              WhatsApp AI for Indian salons
            </div>
            <h1 className="animate-in delay-1" style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: COLORS.text, marginBottom: 24 }}>
              Your salon's AI<br />
              <span style={{ color: COLORS.accent }}>stylist</span> — on<br />
              WhatsApp.
            </h1>
            <p className="animate-in delay-2" style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 36, maxWidth: 440, fontWeight: 300 }}>
              Customers send a selfie, AI suggests styles, generates a photorealistic preview, and books the appointment — all on WhatsApp. Zero app needed.
            </p>
            <div className="animate-in delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => scrollTo("cta")}>Start free trial ↗</button>
              <button className="btn-ghost" onClick={() => scrollTo("how-it-works")}>See how it works</button>
            </div>
            <div className="animate-in delay-4" style={{ marginTop: 40, display: "flex", gap: 32 }}>
              {[["40%", "fewer no-shows"], ["30s", "AI preview"], ["₹999", "to start"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: COLORS.text }}>{n}</div>
                  <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-in delay-5" style={{ flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <WhatsAppMockup />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: "14px 0", overflow: "hidden" }}>
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="ticker-item">
              {item}
              <div className="ticker-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="section-tag" style={{ marginBottom: 16 }}>Features</div>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text, marginBottom: 16 }}>Everything your salon needs</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, maxWidth: 480, margin: "0 auto" }}>Built specifically for Indian salons. No generic SaaS bloat — just what makes your clients come back.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <i className={`ti ${f.icon}`} aria-hidden="true" style={{ fontSize: 20, color: COLORS.accent }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: COLORS.text }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="glow-line" style={{ maxWidth: 1100, margin: "0 auto" }} />

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div className="section-tag" style={{ marginBottom: 20 }}>How it works</div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text, marginBottom: 40 }}>From selfie to booked<br />in 4 steps</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 20, position: "relative", paddingBottom: i < steps.length - 1 ? 36 : 0 }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: "0.05em" }}>{s.num}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, background: COLORS.border, height: "calc(100% - 40px)", margin: "8px auto 0" }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Visual panel */}
          <div style={{ position: "relative" }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,211,102,0.08) 0%, transparent 70%)" }} />
              <div style={{ marginBottom: 20, fontSize: 13, color: COLORS.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>AI Analysis Result</div>
              <div style={{ background: COLORS.surface2, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: COLORS.textMuted }}>Face shape detected</span>
                  <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 500 }}>Oval ✓</span>
                </div>
                {[["High Fade Quiff", 97], ["French Crop", 91], ["Classic Pompadour", 85]].map(([name, score]) => (
                  <div key={name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: COLORS.text }}>{name}</span>
                      <span style={{ color: COLORS.textMuted }}>{score}%</span>
                    </div>
                    <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(to right, #7B2FBE, #9333EA)`, borderRadius: 2, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {["Front view", "Side profile", "Neckline"].map((v) => (
                  <div key={v} style={{ background: COLORS.border, borderRadius: 8, height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-camera" aria-hidden="true" style={{ fontSize: 13, color: COLORS.textDim }} />
                    </div>
                    <span style={{ fontSize: 10, color: COLORS.textDim }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <i className="ti ti-check" aria-hidden="true" style={{ color: COLORS.accent, fontSize: 16 }} />
                <span style={{ fontSize: 13, color: COLORS.text }}>Preview sent to WhatsApp</span>
                <span style={{ fontSize: 12, color: COLORS.textDim, marginLeft: "auto" }}>28s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-tag" style={{ marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text }}>Salons love StylZap</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => (
                    <i key={j} className="ti ti-star-filled" aria-hidden="true" style={{ fontSize: 14, color: COLORS.gold }} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: COLORS.accent }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textDim }}>{t.role} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="section-tag" style={{ marginBottom: 16 }}>Pricing</div>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text, marginBottom: 16 }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, maxWidth: 420, margin: "0 auto" }}>One-time ₹2,999 setup fee, then month-to-month. Cancel anytime.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" }}>
          {plans.map((p, i) => (
            <div key={i} className={`price-card${p.featured ? " featured" : ""}`}>
              {p.featured && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.25)", color: COLORS.accent, fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
                  <i className="ti ti-star-filled" aria-hidden="true" style={{ fontSize: 10 }} />
                  Most popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.textMuted, marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: COLORS.text, letterSpacing: "-0.03em" }}>{p.price}</span>
                <span style={{ fontSize: 14, color: COLORS.textDim }}>{p.period}</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 8 }}>{p.setup}</div>
              <div style={{ fontSize: 13, color: COLORS.accent, fontWeight: 500, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${COLORS.border}` }}>{p.credits}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 28 }}>
                {p.features.map((f, j) => (
                  <div key={j} className="check-item">
                    <div className="dot">
                      <svg viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke={COLORS.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <button className={p.featured ? "btn-primary" : "btn-ghost"} style={{ width: "100%", justifyContent: "center" }} onClick={() => scrollTo("cta")}>
                {p.cta} ↗
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: COLORS.textDim }}>
          Extra AI images ₹10 each · WhatsApp messages billed by Meta at ₹0.115/msg · 14-day free trial · No credit card required
        </div>
      </section>

      <div className="glow-line" style={{ maxWidth: 1100, margin: "0 auto" }} />

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-tag" style={{ marginBottom: 16 }}>FAQ</div>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text }}>Common questions</h2>
        </div>
        <div>
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{f.q}</span>
                <i className={`ti ti-chevron-${openFaq === i ? "up" : "down"}`} aria-hidden="true" style={{ fontSize: 16, color: COLORS.textDim, flexShrink: 0, transition: "transform 0.3s" }} />
              </button>
              <div className={`faq-answer${openFaq === i ? " open" : ""}`}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <i className="ti ti-sparkles" aria-hidden="true" style={{ fontSize: 24, color: COLORS.accent }} />
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: COLORS.text, marginBottom: 16 }}>
            Ready to run your<br />salon on autopilot?
          </h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 36, lineHeight: 1.6 }}>
            14-day free trial. No credit card. Setup in 5 minutes.
          </p>
          {!submitted ? (
             <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 440, margin: "0 auto" }}>
             <input
             type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
             />
            <input
            type="tel"
              placeholder="Phone number (e.g. 9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && handleTrial()}
            />
            <button className="btn-primary" onClick={handleTrial} style={{ justifyContent: "center" }}>
              Get started ↗
            </button>
            </div>
            ) : (
            <div style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.25)", borderRadius: 10, padding: "16px 24px", display: "inline-flex", alignItems: "center", gap: 10, color: COLORS.accent }}>
              <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 18 }} />
              <span style={{ fontWeight: 500 }}>We'll reach out to {email} shortly!</span>
            </div>
          )}
          <div style={{ marginTop: 24, fontSize: 13, color: COLORS.textDim }}>
            Already using StylZap?{" "}
            <a href="/admin" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>Go to dashboard →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 40, flexWrap: "wrap", gap: 32 }}>
            <div>
              <img src={logo} alt="StylZap" style={{ height: 28, width: "auto", objectFit: "contain", marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: COLORS.textDim, maxWidth: 220, lineHeight: 1.6 }}>WhatsApp AI hairstyle SaaS for Indian salons.</p>
            </div>
            <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
              {[
                { heading: "Product", links: ["Features", "Pricing", "How it works", "FAQ"] },
                { heading: "Company", links: ["About", "Contact", "Privacy Policy", "Terms"] },
              ].map((col) => (
                <div key={col.heading}>
                  <div style={{ fontSize: 12, color: COLORS.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>{col.heading}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {col.links.map((l) => (
                      <a key={l} href="#" className="nav-link" style={{ fontSize: 14 }}>{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.textDim }}>© 2026 StylZap. Built for Indian salons.</span>
            <span style={{ fontSize: 13, color: COLORS.textDim }}>Made with ♥ in India</span>
          </div>
        </div>
      </footer>
    </>
  );
}
