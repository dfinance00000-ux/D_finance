import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { 
  FiArrowRight, FiShield, FiZap, FiBarChart2, 
  FiChevronRight, FiCheck, FiCpu, FiTrendingUp, FiLock, FiActivity, FiGlobe, FiLayers, FiMenu, FiX 
} from 'react-icons/fi';

const LandingPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const fetchBlogs = async () => {
      try {
        // 🔥 FIX: Path changed from '/admin/all-blogs' to '/blogs' to match your new backend route
        const res = await API.get('/blogs'); 
        if(res.data && Array.isArray(res.data)) {
          setBlogs(res.data.reverse().slice(0, 3));
        }
      } catch (err) {
        console.log("Finance Node: Running in Professional Static Mode.");
      }
    };
    fetchBlogs();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={masterContainer}>
      <style>{animations}</style>
      
      {/* --- 💎 ULTRA-MODERN FLOATING NAVBAR --- */}
      <nav style={scrolled ? navScrolled : navStyle}>
        <div style={navInner}>
          <div style={logoWrapper}>
            <div style={logoIcon}>
              <FiLayers size={20} color="white" />
            </div>
            <div style={{...logoText, color: scrolled ? '#0f172a' : '#fff'}}>
              D-FINANCE <span style={tm}>PRO</span>
            </div>
          </div>
          
          {/* Desktop Links */}
          <div style={navLinks}>
            <a href="#infra" style={{...linkStyle, color: scrolled ? '#64748b' : '#cbd5e1'}}>Architecture</a>
            <a href="#insights" style={{...linkStyle, color: scrolled ? '#64748b' : '#cbd5e1'}}>Intelligence</a>
            <div style={vDivider}></div>
            <Link to="/login" style={{...loginBtn, color: scrolled ? '#0f172a' : '#fff'}}>Sign In</Link>
            <Link to="/signup" style={scrolled ? signupBtnScrolled : signupBtn}>
              Deploy Protocol <FiArrowRight />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div style={mobileToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <FiX size={24} color={scrolled ? '#000' : '#fff'} /> : <FiMenu size={24} color={scrolled ? '#000' : '#fff'} />}
          </div>
        </div>
      </nav>

      {/* --- IMMERSIVE HERO SECTION --- */}
      <section style={heroWrapper}>
        <div style={heroOverlay}></div>
        <div className="mesh-bg"></div>
        
        <div style={heroContent}>
          <div style={promoBadge}>
            <span className="pulse-dot"></span> 
            <FiShield size={12} /> ENTERPRISE-GRADE LENDING INFRASTRUCTURE
          </div>
          <h1 style={heroTitle}>
            Modernizing <br/>
            The <span style={gradientText}>Financial Engine</span>
          </h1>
          <p style={heroSubText}>
            The infrastructure layer for digital credit. 
            Automate weekly recoveries, verify reports, and scale capital with 256-bit security.
          </p>
          <div style={btnGroup}>
            <Link to="/signup" style={btnPrimary}>Initialize Setup <FiArrowRight /></Link>
            <Link to="/login" style={btnSecondary}>Live Analytics Demo</Link>
          </div>
        </div>
      </section>

      {/* --- LIVE METRICS --- */}
      <div style={statsWrapper}>
        <div style={statBox}><span style={statVal}>₹500Cr+</span><span style={statLab}>Managed</span></div>
        <div style={statBox}><span style={statVal}>100%</span><span style={statLab}>SOP Compliant</span></div>
        <div style={statBox}><span style={statVal}>2ms</span><span style={statLab}>Latency</span></div>
        <div style={statBox}><span style={statVal}>24/7</span><span style={statLab}>Recovery</span></div>
      </div>

      {/* --- CORE INFRASTRUCTURE --- */}
      <section id="infra" style={sectionContainer('#fff')}>
        <div style={centeredHeader}>
          <div style={sectionBadge}>CAPABILITIES</div>
          <h2 style={sectionTitle}>The Architecture of Trust</h2>
        </div>
        
        <div style={gridContainer}>
          <FeatureCard 
            icon={<FiShield />} 
            title="Encrypted Verification" 
            desc="End-to-end field verification with Aadhaar-linked digital identity management."
            color="#2563eb"
          />
          <FeatureCard 
            icon={<FiActivity />} 
            title="Real-time WCE" 
            desc="Predictive weekly collection efficiency tracking for zero manual error."
            color="#10b981"
          />
          <FeatureCard 
            icon={<FiCpu />} 
            title="Smart Ledgers" 
            desc="Automated amortization logic that updates interest and late fees in milliseconds."
            color="#6366f1"
          />
        </div>
      </section>

      {/* --- INSIGHTS --- */}
      <section id="insights" style={sectionContainer('#f8fafc')}>
        <div style={sectionHeaderLeft}>
          <div style={sectionBadge}>INTELLIGENCE</div>
          <h2 style={sectionTitle}>Market Insights</h2>
        </div>

        <div style={blogGrid}>
          {blogs.length > 0 ? blogs.map(blog => (
            <div key={blog._id} className="blog-hover" style={blogCard}>
              {blog.imageUrl && (
                <img src={blog.imageUrl} alt={blog.title} style={blogImg} />
              )}
              <div style={blogCardBody}>
                <div style={blogHeader}>
                  <span style={blogTag}>{blog.category || 'ANALYSIS'}</span>
                  <span style={blogDate}>{new Date(blog.date || blog.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 style={blogTitle}>{blog.title}</h4>
                <p style={blogExcerpt}>{blog.content.substring(0, 100)}...</p>
                <Link to={`/blog/${blog._id}`} style={readMoreLink}>Full Report <FiChevronRight /></Link>
              </div>
            </div>
          )) : (
            <div style={noData}>Awaiting official node updates...</div>
          )}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={footerStyle}>
        <div style={fBottom}>
          <p>© 2026 D-Finance Enterprise. All Systems Secure.</p>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const FeatureCard = ({icon, title, desc, color}) => (
  <div className="card-hover" style={glassFeature}>
    <div style={fIcon(color)}>{icon}</div>
    <h3 style={cardH3}>{title}</h3>
    <p style={cardP}>{desc}</p>
  </div>
);

// --- STYLES ---
const masterContainer = { fontFamily: '"Plus Jakarta Sans", sans-serif', background: '#fff', color: '#0f172a' };

const navStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  padding: '20px 0', position: 'fixed', width: '100%', top: 0, zIndex: 2000,
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};

const navScrolled = {
  ...navStyle,
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(25px) saturate(180%)',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  padding: '12px 0',
};

const navInner = {
  width: '85%', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const logoWrapper = { display: 'flex', alignItems: 'center', gap: '10px' };
const logoIcon = { background: '#0f172a', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const logoText = { fontSize: '20px', fontWeight: '950', letterSpacing: '-1px', transition: '0.3s' };
const tm = { fontSize: '9px', color: '#3b82f6', verticalAlign: 'top' };

const navLinks = { display: 'none', gap: '30px', alignItems: 'center' };
if (typeof window !== 'undefined' && window.innerWidth > 900) { navLinks.display = 'flex'; }

const linkStyle = { textDecoration: 'none', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', transition: '0.3s' };
const vDivider = { width: '1px', height: '15px', background: 'rgba(0,0,0,0.1)' };
const loginBtn = { textDecoration: 'none', fontWeight: '900', fontSize: '13px', transition: '0.3s' };

const signupBtn = { 
  textDecoration: 'none', background: '#fff', color: '#0f172a', 
  padding: '10px 22px', borderRadius: '12px', fontSize: '12px', 
  fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: '0.4s'
};

const signupBtnScrolled = {
  ...signupBtn,
  background: '#0f172a', color: '#fff'
};

const mobileToggle = { display: 'flex', cursor: 'pointer' };
if (typeof window !== 'undefined' && window.innerWidth > 900) { mobileToggle.display = 'none'; }

const heroWrapper = {
  height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 8%',
  background: '#010514', color: '#fff', overflow: 'hidden'
};

const heroOverlay = { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #010514)', zIndex: 3 };

const heroContent = { position: 'relative', zIndex: 10, maxWidth: '850px' };
const promoBadge = { display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: '100px', fontSize: '10px', fontWeight: '900', marginBottom: '30px', color: '#94a3b8' };

const heroTitle = { fontSize: 'clamp(42px, 8vw, 86px)', fontWeight: '950', lineHeight: '0.9', letterSpacing: '-5px', marginBottom: '25px' };
const gradientText = { background: 'linear-gradient(90deg, #60a5fa, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroSubText = { fontSize: '20px', color: '#64748b', lineHeight: '1.6', marginBottom: '45px', maxWidth: '600px' };

const btnGroup = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const btnPrimary = { padding: '20px 40px', background: '#fff', color: '#0f172a', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.4s ease' };
const btnSecondary = { padding: '20px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: '800', backdropFilter: 'blur(10px)' };

const statsWrapper = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '60px 8%', background: '#fff', borderBottom: '1px solid #f1f5f9' };
const statBox = { textAlign: 'center', display: 'flex', flexDirection: 'column' };
const statVal = { fontSize: '32px', fontWeight: 950, color: '#0f172a', letterSpacing: '-1.5px' };
const statLab = { fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginTop: '5px' };

const sectionContainer = (bg) => ({ padding: '140px 8%', background: bg });
const centeredHeader = { textAlign: 'center', marginBottom: '80px' };
const sectionBadge = { fontSize: '11px', fontWeight: '950', color: '#3b82f6', letterSpacing: '3px', marginBottom: '15px' };
const sectionTitle = { fontSize: '52px', fontWeight: '950', letterSpacing: '-3px', lineHeight: 1 };

const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' };
const glassFeature = { background: '#fff', padding: '50px', borderRadius: '44px', border: '1px solid #f1f5f9', transition: '0.4s' };
const fIcon = (color) => ({ width: '56px', height: '56px', background: `${color}10`, color: color, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '30px' });
const cardH3 = { fontSize: '24px', fontWeight: '950', marginBottom: '15px', letterSpacing: '-1px' };
const cardP = { color: '#64748b', fontSize: '16px', lineHeight: '1.7', margin: 0 };

const sectionHeaderLeft = { marginBottom: '60px' };
const blogGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '35px' };
const blogCard = { borderRadius: '44px', border: '1px solid #f1f5f9', background: '#fff', transition: '0.4s', overflow: 'hidden' };
const blogCardBody = { padding: '40px' };
const blogImg = { width: '100%', height: '220px', objectFit: 'cover' };
const blogHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' };
const blogTag = { fontSize: '9px', fontWeight: '950', color: '#3b82f6', background: '#eff6ff', padding: '6px 14px', borderRadius: '10px' };
const blogDate = { fontSize: '12px', color: '#94a3b8', fontWeight: '800' };
const blogTitle = { fontSize: '24px', fontWeight: '950', marginBottom: '20px', lineHeight: '1.2' };
const blogExcerpt = { color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '35px' };
const readMoreLink = { textDecoration: 'none', color: '#0f172a', fontWeight: '950', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' };
const noData = { padding: '80px', textAlign: 'center', color: '#cbd5e1', fontWeight: '900', border: '2px dashed #f1f5f9', borderRadius: '40px', width: '100%' };

const footerStyle = { background: '#010514', color: '#fff', padding: '100px 8% 50px 8%' };
const fBottom = { borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '40px', textAlign: 'center', fontSize: '11px', fontWeight: '900', letterSpacing: '2px', color: '#475569' };

const animations = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  body { scroll-behavior: smooth; margin: 0; }

  .mesh-bg {
    position: absolute;
    width: 100%; height: 100%;
    background: radial-gradient(at 100% 0%, #1e3a8a 0px, transparent 50%),
                radial-gradient(at 0% 100%, #111827 0px, transparent 50%);
    opacity: 0.5;
    z-index: 2;
  }

  .pulse-dot {
    width: 6px; height: 6px; background: #10b981; border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); animation: pulse 2s infinite;
  }

  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

  .card-hover:hover { transform: translateY(-15px) scale(1.02); box-shadow: 0 35px 70px rgba(0,0,0,0.08); border-color: #3b82f6; }
  
  .blog-hover:hover { background: #0f172a !important; border-color: #0f172a !important; }
  .blog-hover:hover h4, .blog-hover:hover p, .blog-hover:hover a { color: #fff !important; }
`;

export default LandingPage;