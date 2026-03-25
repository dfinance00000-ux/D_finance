import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios'; // Humne jo axios instance banaya tha
import { FiArrowRight, FiShield, FiZap, FiBarChart2, FiGlobe } from 'react-icons/fi';

const LandingPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    // Backend se live blogs fetch karna
    const fetchBlogs = async () => {
      try {
        const res = await API.get('/admin/all-blogs'); // Ensure ye route backend mein ho
        setBlogs(res.data.reverse().slice(0, 3)); // Latest 3 blogs
      } catch (err) {
        console.log("Insights not found, using fallback.");
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div style={containerStyle}>
      {/* --- PREMIUM NAVBAR --- */}
      <nav style={navStyle}>
        <div style={logoWrapper}>
          <div style={logoIcon}>D</div>
          <div style={logoText}>D-FINANCE</div>
        </div>
        <div style={navLinks}>
          <a href="#features" style={linkStyle}>Infrastructure</a>
          <a href="#investor-blog" style={linkStyle}>Investor Desk</a>
          <a href="#contact" style={linkStyle}>Network</a>
          <div style={vDivider}></div>
          <Link to="/login" style={loginBtn}>Login Portal</Link>
          <Link to="/signup" style={signupBtn}>Get Started <FiArrowRight /></Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={heroStyle}>
        <div style={badgeStyle}>
          <span style={dot}></span> SOP 1.3.11 COMPLIANT INFRASTRUCTURE
        </div>
        <h1 style={heroTitle}>
          Next-Gen <span style={gradientText}>Digital Lending</span> <br/>
          For Modern Enterprises
        </h1>
        <p style={heroSub}>
          India's most secure loan management infrastructure. Built with multi-tier 
          verification, real-time audit trails, and automated compliance.
        </p>
        <div style={heroActions}>
          <Link to="/signup" style={ctaPrimary}>Build Your Network</Link>
          <Link to="/login" style={ctaSecondary}>Partner Access</Link>
        </div>
      </header>

      {/* --- STATS BAR --- */}
      <div style={statsBar}>
        <div style={statItem}><strong>₹500Cr+</strong> <p>Volume Managed</p></div>
        <div style={statItem}><strong>20k+</strong> <p>Active Customers</p></div>
        <div style={statItem}><strong>99.9%</strong> <p>Uptime SLA</p></div>
        <div style={statItem}><strong>100%</strong> <p>SOP Compliant</p></div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section id="features" style={featureSection}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Enterprise-Grade Security</h2>
          <p style={sectionSub}>Designed for the complex needs of Mathura's financial growth.</p>
        </div>
        <div style={featureGrid}>
          <div style={featureCard}>
            <div style={iconBox}><FiShield /></div>
            <h4>Fraud Prevention</h4>
            <p>Aadhaar & PAN verification integrated with Sandbox AI.</p>
          </div>
          <div style={featureCard}>
            <div style={iconBox}><FiZap /></div>
            <h4>Instant Approval</h4>
            <p>Automated credit scoring and dynamic limit allocation.</p>
          </div>
          <div style={featureCard}>
            <div style={iconBox}><FiBarChart2 /></div>
            <h4>Real-time Audit</h4>
            <p>Every transaction is logged with immutable audit trails.</p>
          </div>
        </div>
      </section>

      {/* --- INVESTOR INSIGHTS (BLOG SECTION) --- */}
      <section id="investor-blog" style={blogSection}>
        <div style={sectionHeaderLeft}>
          <h2 style={sectionTitle}>Investor Insights</h2>
          <p style={sectionSub}>Strategic market analysis from our executive board.</p>
        </div>
        
        <div style={blogGrid}>
          {blogs.length > 0 ? blogs.map(blog => (
            <div key={blog._id} style={blogCard}>
              <div style={blogHeader}>
                <span style={blogTag}>{blog.category || 'INSIGHT'}</span>
                <span style={blogDate}>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 style={blogCardTitle}>{blog.title}</h4>
              <p style={blogCardText}>{blog.content.substring(0, 120)}...</p>
              <Link to={`/blog/${blog._id}`} style={readMore}>Read Full Report <FiArrowRight /></Link>
            </div>
          )) : (
            <div style={skeletonCard}>No recent insights published.</div>
          )}
        </div>
      </section>

      {/* --- PROFESSIONAL FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerMain}>
          <div style={footerBrand}>
            <div style={{...logoWrapper, marginBottom: '20px'}}>
               <div style={{...logoIcon, background: '#fff', color: '#0f172a'}}>D</div>
               <div style={{...logoText, color: '#fff'}}>D-FINANCE</div>
            </div>
            <p style={footerDesc}>
              Premier digital lending infrastructure provider. Committed to 
              secure credit systems under Federal SOP Guidelines.
            </p>
          </div>

          <div style={footerLinksGroup}>
            <div>
              <h4 style={footerHeading}>Company</h4>
              <ul style={footerList}>
                <li>About Platform</li>
                <li>Compliance SOP</li>
                <li>Investor Desk</li>
              </ul>
            </div>
            <div>
              <h4 style={footerHeading}>Office</h4>
              <p style={officeAddress}>
                D-Finance Tower, 4th Floor,<br/>
                Highway Plaza, Mathura, UP
              </p>
            </div>
          </div>
        </div>
        <div style={footerBottom}>
          <p>© 2026 D-Finance Enterprise. All rights reserved.</p>
          <div style={socialLinks}>LinkedIn • Twitter • System Status</div>
        </div>
      </footer>
    </div>
  );
};

// --- MODERN STYLES ---
const containerStyle = { fontFamily: '"Inter", sans-serif', color: '#1e293b', background: '#fff' };

const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 8%', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid #f1f5f9' };
const logoWrapper = { display: 'flex', alignItems: 'center', gap: '10px' };
const logoIcon = { background: '#2563eb', color: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '900' };
const logoText = { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' };
const navLinks = { display: 'flex', gap: '25px', alignItems: 'center' };
const linkStyle = { textDecoration: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', transition: '0.3s hover' };
const vDivider = { width: '1px', height: '24px', background: '#e2e8f0' };
const loginBtn = { textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '14px' };
const signupBtn = { textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' };

const heroStyle = { padding: '120px 10% 80px 10%', textAlign: 'center', background: 'radial-gradient(circle at top, #f8fafc 0%, #fff 100%)' };
const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', marginBottom: '30px', border: '1px solid #e2e8f0' };
const dot = { width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' };
const heroTitle = { fontSize: '64px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', lineHeight: '1.1', letterSpacing: '-2px' };
const gradientText = { background: 'linear-gradient(90deg, #2563eb, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroSub = { fontSize: '18px', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' };
const heroActions = { marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' };
const ctaPrimary = { padding: '16px 32px', background: '#2563eb', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 10px 20px rgba(37,99,235,0.2)' };
const ctaSecondary = { padding: '16px 32px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' };

const statsBar = { display: 'flex', justifyContent: 'center', gap: '60px', padding: '40px', background: '#fff', borderTop: '1px solid #f1f5f9' };
const statItem = { textAlign: 'center', fontSize: '24px', fontWeight: '800' };

const featureSection = { padding: '100px 10%', background: '#f8fafc' };
const sectionHeader = { textAlign: 'center', marginBottom: '60px' };
const sectionTitle = { fontSize: '36px', fontWeight: '900', color: '#0f172a' };
const sectionSub = { color: '#64748b', fontSize: '16px', marginTop: '10px' };
const featureGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' };
const featureCard = { padding: '40px', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', transition: '0.3s' };
const iconBox = { fontSize: '24px', color: '#2563eb', marginBottom: '20px' };

const blogSection = { padding: '100px 10%' };
const sectionHeaderLeft = { marginBottom: '50px' };
const blogGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' };
const blogCard = { padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', background: '#fff', display: 'flex', flexDirection: 'column' };
const blogHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const blogTag = { background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' };
const blogDate = { fontSize: '12px', color: '#94a3b8' };
const blogCardTitle = { fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a' };
const blogCardText = { color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' };
const readMore = { textDecoration: 'none', color: '#2563eb', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' };
const skeletonCard = { padding: '40px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '24px' };

const footerStyle = { background: '#0f172a', color: '#fff', padding: '100px 10% 40px 10%' };
const footerMain = { display: 'flex', justifyContent: 'space-between', gap: '50px', flexWrap: 'wrap' };
const footerBrand = { maxWidth: '350px' };
const footerDesc = { color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' };
const footerLinksGroup = { display: 'flex', gap: '80px' };
const footerHeading = { fontSize: '15px', color: '#fff', fontWeight: '800', marginBottom: '25px' };
const footerList = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#64748b', fontSize: '14px' };
const officeAddress = { color: '#64748b', fontSize: '14px', lineHeight: '1.6' };
const footerBottom = { marginTop: '80px', paddingTop: '30px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '13px' };
const socialLinks = { display: 'flex', gap: '20px' };

export default LandingPage;