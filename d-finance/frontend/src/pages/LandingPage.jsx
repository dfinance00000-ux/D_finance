import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { 
  FiArrowRight, FiShield, FiZap, FiChevronRight, FiCheck, 
  FiCpu, FiActivity, FiLayers, FiMenu, FiX, FiLock, FiStar, FiTrendingUp 
} from 'react-icons/fi';

const LandingPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const fetchBlogs = async () => {
      try {
        const res = await API.get('/blogs'); 
        if(res.data) setBlogs(res.data.reverse().slice(0, 3));
      } catch (err) { console.log("Static Mode Active"); }
    };
    fetchBlogs();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={masterContainer}>
      <style>{animations}</style>
      
      {/* --- 💎 PREMIUM GLASS NAVBAR --- */}
      <nav style={scrolled ? navScrolled : navStyle}>
        <div style={navInner}>
          <motion.div whileHover={{ scale: 1.02 }} style={logoWrapper}>
            <div style={logoIcon}><FiLayers size={20} color="white" /></div>
            <div style={{...logoText, color: scrolled ? '#0f172a' : '#fff'}}>
              D-FINANCE <span style={tm}>PRO</span>
            </div>
          </motion.div>
          
          <div className="desktop-menu" style={navLinks}>
            <a href="#architecture" style={{...linkStyle, color: scrolled ? '#64748b' : '#cbd5e1'}}>Architecture</a>
            <a href="#intelligence" style={{...linkStyle, color: scrolled ? '#64748b' : '#cbd5e1'}}>Intelligence</a>
            <div style={vDivider}></div>
            <Link to="/login" style={{...loginBtn, color: scrolled ? '#0f172a' : '#fff'}}>Sign In</Link>
            <Link to="/signup" style={scrolled ? signupBtnScrolled : signupBtn}>Get Started</Link>
          </div>

          <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={mobileToggleStyle}>
             {isMobileMenuOpen ? <FiX size={24} color="#fff" /> : <FiMenu size={24} color={scrolled ? '#000' : '#fff'} />}
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={mobileDropdownStyle}>
              <a href="#architecture" onClick={() => setIsMobileMenuOpen(false)} style={mobLink}>Architecture</a>
              <a href="#intelligence" onClick={() => setIsMobileMenuOpen(false)} style={mobLink}>Intelligence</a>
              <Link to="/login" style={mobLink}>Sign In</Link>
              <Link to="/signup" style={mobBtn}>Launch App</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- 🚀 HERO SECTION --- */}
      <section style={heroWrapper}>
        <div className="animated-mesh"></div>
        <div style={heroContent}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={promoBadge}>
              <span className="pulse-dot"></span> 
              <FiLock size={12} style={{marginRight: '8px'}}/> SECURE FINANCIAL LEDGER ACTIVE
            </div>
            <h1 style={heroTitle}>
              Powering the <span style={gradientText}>Next Gen</span> <br/> 
              of Digital Lending.
            </h1>
            <p style={heroSubText}>
              The institutional infrastructure for digital credit. Automate recoveries, 
              verify identities, and scale capital with 256-bit security.
            </p>
            <div className="hero-btns" style={btnGroup}>
              <Link to="/signup" style={btnPrimary}>Start Free Trial <FiArrowRight /></Link>
              <Link to="/login" style={btnSecondary}>View Live Demo</Link>
            </div>
          </motion.div>
        </div>

        <motion.div className="hero-image-container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="browser-mockup">
            <div className="browser-header">
              <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
              <div className="address-bar">d-finance.pro/analytics</div>
            </div>
            <div className="browser-body">
              <img src="https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Dashboard" style={previewImg} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- 📊 STATS --- */}
      <div style={statsWrapper} className="stats-grid">
        <StatBox val="₹500Cr+" lab="Assets Managed" />
        <StatBox val="99.9%" lab="Recovery Rate" />
        <StatBox val="2ms" lab="API Latency" />
        <StatBox val="10k+" lab="Active Lenders" />
      </div>

      {/* --- 💎 CAPABILITIES --- */}
      <section id="architecture" style={sectionContainer('#fff')}>
        <div style={centeredHeader}>
          <div style={sectionBadge}>CAPABILITIES</div>
          <h2 style={sectionTitle}>The Architecture of Trust</h2>
        </div>
        <div className="feature-grid" style={gridContainer}>
          <FeatureCard icon={<FiShield />} title="Verification" desc="Aadhaar-linked field audit system." benefit="Faster Approvals" color="#2563eb" />
          <FeatureCard icon={<FiActivity />} title="WCE Logic" desc="Weekly collection efficiency engine." benefit="Zero Manual Error" color="#10b981" />
          <FeatureCard icon={<FiCpu />} title="Smart Ledgers" desc="Real-time amortization automation." benefit="100% Transparency" color="#6366f1" />
        </div>
      </section>

      {/* --- ⭐ TESTIMONIALS --- */}
      <section style={testimonialSectionStyle}>
        <div style={centeredHeader}>
          <div style={sectionBadge}>REVIEWS</div>
          <h2 style={sectionTitle}>Success Stories</h2>
        </div>
        <div className="feature-grid" style={gridContainer}>
          <TestimonialCard name="Aman Singh" role="Manager, Mathura Branch" text="D-Finance changed how we track recoveries. Our WCE improved by 40% in two months." />
          <TestimonialCard name="Priya Verma" role="Financial Analyst" text="The real-time ledger sync is life-saving for audits. Pure institutional level tech." />
        </div>
      </section>

      {/* --- 🧠 INTELLIGENCE --- */}
      <section id="intelligence" style={sectionContainer('#f8fafc')}>
        <div style={blogHeaderTop}>
           <div style={{textAlign: 'left'}}>
            <div style={sectionBadge}>INTELLIGENCE</div>
            <h2 style={sectionTitle}>Market Insights</h2>
          </div>
          <Link to="/blogs" className="view-all">View All <FiChevronRight /></Link>
        </div>

        <div className="blog-grid-resp" style={blogGrid}>
          {blogs.length > 0 ? blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          )) : (
            <div style={noData}>⚡ Insights coming soon to your node...</div>
          )}
        </div>
      </section>

      {/* --- 📞 FINAL CTA --- */}
      <section style={ctaSection}>
        <div style={ctaCard}>
            <h2 style={ctaTitle}>Ready to scale your <br/> lending infrastructure?</h2>
            <p style={ctaText}>Join 1,000+ lenders modernizing their digital credit operations.</p>
            <Link to="/signup" style={btnPrimaryLarge}>Start Free Trial Now</Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerMain}>
          <div style={fBrandStyle}>
            <h2 style={fLogo}>D-FINANCE</h2>
            <p style={fText}>Governed by Federal SOP standards. SECURE-NODE-2026.</p>
          </div>
          <div style={fLinksGroupStyle}>
            <div style={fColumnStyle}><h4 style={fHeadingStyle}>Platform</h4><p style={fLinkStyle}>API Docs</p><p style={fLinkStyle}>Status</p></div>
            <div style={fColumnStyle}><h4 style={fHeadingStyle}>Legal</h4><p style={fLinkStyle}>Privacy Policy</p><p style={fLinkStyle}>Terms</p></div>
          </div>
        </div>
        <div style={fBottom}>
          <p>© 2026 D-Finance Enterprise. 256-bit AES Encrypted.</p>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatBox = ({ val, lab }) => (
  <div style={statBoxStyle}>
    <span style={statValStyle}>{val}</span>
    <span style={statLabStyle}>{lab}</span>
  </div>
);

const FeatureCard = ({icon, title, desc, benefit, color}) => (
  <div className="glass-card card-hover" style={glassFeature}>
    <div style={fIcon(color)}>{icon}</div>
    <h3 style={cardH3}>{title}</h3>
    <p style={cardP}>{desc}</p>
    <div style={benefitTag}><FiCheck size={12} /> {benefit}</div>
  </div>
);

const TestimonialCard = ({name, role, text}) => (
  <div style={glassFeature}>
    <div style={{display:'flex', gap:'4px', marginBottom:'15px'}}>
        {[...Array(5)].map((_, i) => <FiStar key={i} size={14} color="#f59e0b" fill="#f59e0b" />)}
    </div>
    <p style={{...cardP, fontStyle:'italic', marginBottom:'20px'}}>"{text}"</p>
    <h4 style={{margin:0, fontSize:'16px'}}>{name}</h4>
    <small style={{color:'#64748b'}}>{role}</small>
  </div>
);

const BlogCard = ({blog}) => (
  <div style={blogCardStyle} className="blog-hover">
    <div style={blogImgWrapper}><img src={blog.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500"} alt={blog.title} style={blogImgStyle} /></div>
    <div style={blogCardBodyStyle}>
      <div style={blogHeaderStyle}><span style={blogTagStyle}>{blog.category || 'ANALYSIS'}</span><span style={blogDateStyle}>5 min read</span></div>
      <h4 style={blogTitleStyle}>{blog.title}</h4>
      <Link to={`/blog/${blog._id}`} style={readMoreLinkStyle}>Read Report <FiArrowRight /></Link>
    </div>
  </div>
);

// --- 🎨 STYLES ---
const masterContainer = { background: '#fff', color: '#0f172a', overflowX: 'hidden', fontFamily: '"Plus Jakarta Sans", sans-serif' };
const navStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '25px 0', position: 'fixed', width: '100%', top: 0, zIndex: 2000, transition: '0.4s ease' };
const navScrolled = { ...navStyle, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '15px 0' };
const navInner = { width: '90%', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoWrapper = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const logoIcon = { background: '#0f172a', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const logoText = { fontSize: '22px', fontWeight: '950', letterSpacing: '-1px' };
const tm = { fontSize: '9px', color: '#3b82f6', verticalAlign: 'top' };
const navLinks = { display: 'none', gap: '30px', alignItems: 'center' };
const linkStyle = { textDecoration: 'none', fontSize: '13px', fontWeight: '700' };
const vDivider = { width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' };
const loginBtn = { textDecoration: 'none', fontWeight: '800', fontSize: '14px' };
const signupBtn = { textDecoration: 'none', background: '#fff', color: '#0f172a', padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const signupBtnScrolled = { ...signupBtn, background: '#0f172a', color: '#fff' };

const heroWrapper = { minHeight: '100vh', padding: '120px 5% 60px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', background: '#010514', color: '#fff', position: 'relative', overflow: 'hidden' };
const heroContent = { flex: 1, position: 'relative', zIndex: 10 };
const heroTitle = { fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: '950', lineHeight: 1.1, marginBottom: '25px', letterSpacing: '-3px' };
const heroSubText = { fontSize: '20px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px' };
const gradientText = { background: 'linear-gradient(90deg, #60a5fa, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

const previewImg = { width: '100%', borderRadius: '0 0 12px 12px', display: 'block', objectFit: 'cover' };
const promoBadge = { display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', marginBottom: '25px', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
const btnGroup = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const btnPrimary = { padding: '20px 35px', background: '#3b82f6', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' };
const btnSecondary = { padding: '20px 35px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: '800' };

const statsWrapper = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '60px 5%', background: '#fff', borderBottom: '1px solid #f1f5f9' };
const statBoxStyle = { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px' };
const statValStyle = { fontSize: '42px', fontWeight: '950', color: '#0f172a', letterSpacing: '-2px' };
const statLabStyle = { fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };

const sectionContainer = (bg) => ({ padding: '120px 5%', background: bg });
const centeredHeader = { textAlign: 'center', marginBottom: '80px' };
const sectionBadge = { fontSize: '12px', fontWeight: '950', color: '#3b82f6', letterSpacing: '3px', marginBottom: '15px' };
const sectionTitle = { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '950', letterSpacing: '-2px', lineHeight: 1 };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' };
const glassFeature = { background: '#fff', padding: '45px', borderRadius: '35px', border: '1px solid #f1f5f9', transition: '0.4s ease' };
const fIcon = (color) => ({ width: '64px', height: '64px', background: `${color}10`, color: color, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '25px' });
const cardH3 = { fontSize: '24px', fontWeight: '950', marginBottom: '15px' };
const cardP = { color: '#64748b', fontSize: '16px', lineHeight: 1.6 };
const benefitTag = { marginTop: '20px', fontSize: '12px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' };

const trustSection = { padding: '60px 5%', textAlign: 'center', borderBottom: '1px solid #f1f5f9' };
const trustLabel = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '3px', marginBottom: '30px' };
const logoRow = { display: 'flex', justifyContent: 'center', gap: '60px', opacity: 0.4, flexWrap: 'wrap' };
const trustLogo = { fontSize: '20px', fontWeight: '950', letterSpacing: '5px' };

const testimonialSectionStyle = { padding: '120px 5%', background: '#fff' };
const blogHeaderTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' };
const blogGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' };
const blogCardStyle = { borderRadius: '30px', background: '#fff', border: '1px solid #f1f5f9', overflow: 'hidden', transition: '0.4s' };
const blogImgWrapper = { width: '100%', height: '220px', overflow: 'hidden' };
const blogImgStyle = { width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' };
const blogCardBodyStyle = { padding: '30px' };
const blogHeaderStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
const blogTagStyle = { fontSize: '9px', fontWeight: '950', color: '#3b82f6', background: '#eff6ff', padding: '6px 14px', borderRadius: '10px' };
const blogDateStyle = { fontSize: '11px', color: '#94a3b8', fontWeight: '800' };
const blogTitleStyle = { fontSize: '20px', fontWeight: '950', marginBottom: '15px', lineHeight: '1.3' };
const readMoreLinkStyle = { textDecoration: 'none', color: '#0f172a', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' };

const ctaSection = { padding: '100px 5%' };
const ctaCard = { background: '#0f172a', borderRadius: '50px', padding: '80px 40px', textAlign: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' };
const ctaTitle = { fontSize: '48px', fontWeight: '950', marginBottom: '20px', lineHeight: 1 };
const ctaText = { color: '#94a3b8', fontSize: '18px', marginBottom: '40px' };
const btnPrimaryLarge = { ...btnPrimary, display: 'inline-flex', padding: '25px 50px', fontSize: '18px' };

const footerStyle = { background: '#010514', color: '#fff', padding: '100px 5% 40px 5%' };
const footerMain = { display: 'flex', justifyContent: 'space-between', gap: '60px', flexWrap: 'wrap', marginBottom: '80px' };
const fBrandStyle = { maxWidth: '400px' }; // FIXED: Defined fBrand
const fLogo = { fontSize: '26px', fontWeight: '950', color: '#3b82f6' };
const fText = { color: '#64748b', marginTop: '15px' };
const fLinksGroupStyle = { display: 'flex', gap: '80px' }; // FIXED: Defined fLinksGroup
const fColumnStyle = { display: 'flex', flexDirection: 'column', gap: '15px' }; // FIXED: Defined fColumn
const fHeadingStyle = { fontWeight: '900', fontSize: '14px', marginBottom: '10px' }; // FIXED: Defined fHeading
const fLinkStyle = { color: '#64748b', fontSize: '14px', fontWeight: '600' }; // FIXED: Defined fLink
const fBottom = { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', textAlign: 'center', color: '#475569', fontSize: '12px' };

const mobileToggleStyle = { cursor: 'pointer', display: 'none', zIndex: 3000 };
const mobileDropdownStyle = { position: 'fixed', inset: 0, background: '#0f172a', padding: '100px 40px', display: 'flex', flexDirection: 'column', gap: '30px', zIndex: 2500 };
const mobLink = { textDecoration: 'none', color: '#fff', fontSize: '24px', fontWeight: '900' };
const mobBtn = { ...mobLink, color: '#3b82f6' };
const noData = { textAlign: 'center', padding: '60px', color: '#cbd5e1', fontWeight: '900', width: '100%' };

const animations = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  body { scroll-behavior: smooth; margin: 0; }
  .animated-mesh { position: absolute; width: 100%; height: 100%; background: radial-gradient(at 80% 0%, #1e3a8a 0px, transparent 50%), radial-gradient(at 0% 100%, #111827 0px, transparent 50%); opacity: 0.6; z-index: 1; }
  
  .browser-mockup { width: 100%; max-width: 600px; border-radius: 12px; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); overflow: hidden; }
  .browser-header { height: 40px; background: #0f172a; display: flex; align-items: center; padding: 0 15px; gap: 8px; }
  .browser-header .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot.red { background: #ff5f56; } .dot.yellow { background: #ffbd2e; } .dot.green { background: #27c93f; }
  .address-bar { flex: 1; background: #1e293b; height: 24px; border-radius: 6px; margin-left: 10px; display: flex; align-items: center; padding: 0 10px; font-size: 10px; color: #64748b; font-family: monospace; }

  @media (min-width: 901px) { .desktop-menu { display: flex !important; } .hero-image-container { display: flex !important; flex: 1; justify-content: flex-end; } }
  @media (max-width: 900px) { 
    .mobile-toggle { display: block !important; } 
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .hero-image-container { display: none; }
    .hero-btns { flex-direction: column; }
    .hero-btns a { width: 100%; text-align: center; justify-content: center; }
  }
  .blog-hover:hover img { transform: scale(1.1); }
  .card-hover:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.1); border-color: #3b82f6 !important; }
  .pulse-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; display: inline-block; margin-right: 10px; box-shadow: 0 0 0 0 rgba(59,130,246,0.7); animation: pulse 2s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); } 70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
`;

export default LandingPage;