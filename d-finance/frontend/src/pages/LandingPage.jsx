import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    // Database se blogs fetch karein
    fetch('http://localhost:5000/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data.reverse()))
      .catch(err => console.log("No blogs found"));
  }, []);

  return (
    <div style={containerStyle}>
      {/* --- NAVBAR --- */}
      <nav style={navStyle}>
        <div style={logoStyle}>D-FINANCE</div>
        <div style={navLinks}>
          <a href="#about" style={linkStyle}>SOP Guide</a>
          <a href="#investor-blog" style={linkStyle}>Investor Desk</a>
          <Link to="/login" style={loginBtn}>Login Portal</Link>
          <Link to="/signup" style={signupBtn}>Get Started</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={heroStyle}>
        <div style={badgeStyle}>SOP 1.3.11 CERTIFIED</div>
        <h1 style={heroTitle}>Building Trust through <br/><span style={{color: '#059669'}}>Financial Integrity</span></h1>
        <p style={heroSub}>Advanced Loan Management System with multi-tier verification and real-time audit trails.</p>
        <div style={{marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
          <Link to="/signup" style={ctaPrimary}>Apply Now</Link>
          <Link to="/login" style={ctaSecondary}>Partner Access</Link>
        </div>
      </header>

      {/* --- INVESTOR INSIGHTS (CLEAN VIEW) --- */}
      <section id="investor-blog" style={blogSection}>
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
          <h2 style={{fontSize: '36px', fontWeight: '800'}}>Investor Insights</h2>
          <div style={{width: '60px', height: '4px', background: '#059669', margin: '15px auto'}}></div>
          <p style={{color: '#64748b'}}>Strategic updates and market analysis from our executive board.</p>
        </div>
        
        <div style={blogGrid}>
          {blogs.length > 0 ? blogs.map(blog => (
            <div key={blog.id} style={blogCard}>
              <div style={blogTag}>{blog.category || 'MARKET UPDATE'}</div>
              <h4 style={blogCardTitle}>{blog.title}</h4>
              <p style={blogCardText}>{blog.content}</p>
              <div style={blogFooter}>
                <span style={blogDate}>{new Date(blog.date).toLocaleDateString()}</span>
                <span style={{color: '#059669', fontSize: '12px', fontWeight: 'bold'}}>Admin Desk</span>
              </div>
            </div>
          )) : (
            <p style={{textAlign: 'center', gridColumn: '1/-1', color: '#94a3b8'}}>Currently no insights published.</p>
          )}
        </div>
      </section>

      {/* --- PROFESSIONAL FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerMain}>
          <div style={footerBrand}>
            <h2 style={{color: '#fff', margin: 0}}>D-FINANCE</h2>
            <p style={{color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginTop: '15px'}}>
              India's premier digital lending infrastructure provider. <br/>
              Committed to transparent and secure credit systems <br/>
              as per Federal SOP Guidelines.
            </p>
          </div>

          <div style={footerLinksGroup}>
            <div>
              <h4 style={footerHeading}>Company</h4>
              <ul style={footerList}>
                <li>About Us</li>
                <li>SOP Compliance</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 style={footerHeading}>Support</h4>
              <ul style={footerList}>
                <li>Customer Help</li>
                <li>Advisor Portal</li>
                <li>Admin Desk</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 style={footerHeading}>Office Address</h4>
              <p style={{color: '#94a3b8', fontSize: '13px', lineHeight: '1.8'}}>
                D-Finance Tower, 4th Floor,<br/>
                Highway Plaza, Mathura,<br/>
                Uttar Pradesh - 281001
              </p>
              <p style={{color: '#10b981', fontSize: '13px', fontWeight: 'bold'}}>contact@dfinance.com</p>
            </div>
          </div>
        </div>

        <div style={footerBottom}>
          <p>© 2026 D-Finance Enterprise. All rights reserved.</p>
          <div style={socialLinks}>
            <span>LinkedIn</span> • <span>Twitter</span> • <span>Official Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Styles (Corporate Look) ---
const containerStyle = { fontFamily: '"Plus Jakarta Sans", sans-serif', scrollBehavior: 'smooth' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 8%', background: '#fff', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f1f5f9' };
const logoStyle = { fontSize: '24px', fontWeight: '900', color: '#059669' };
const navLinks = { display: 'flex', gap: '30px', alignItems: 'center' };
const linkStyle = { textDecoration: 'none', color: '#475569', fontSize: '14px', fontWeight: '600' };
const loginBtn = { textDecoration: 'none', color: '#1e293b', fontWeight: 'bold', fontSize: '14px' };
const signupBtn = { textDecoration: 'none', background: '#059669', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' };

const heroStyle = { padding: '100px 10% 80px 10%', textAlign: 'center', background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)' };
const heroTitle = { fontSize: '60px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' };
const heroSub = { fontSize: '18px', color: '#64748b', maxWidth: '650px', margin: '0 auto' };
const badgeStyle = { background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', marginBottom: '20px', display: 'inline-block' };
const ctaPrimary = { padding: '18px 35px', background: '#0f172a', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' };
const ctaSecondary = { padding: '18px 35px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' };

const blogSection = { padding: '80px 10%', background: '#fff' };
const blogGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' };
const blogCard = { padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' };
const blogTag = { color: '#059669', fontSize: '10px', fontWeight: 'bold', marginBottom: '10px' };
const blogCardTitle = { fontSize: '20px', margin: '0 0 15px 0' };
const blogCardText = { color: '#64748b', fontSize: '14px', lineHeight: '1.6' };
const blogFooter = { marginTop: '20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '15px' };
const blogDate = { fontSize: '12px', color: '#94a3b8' };

// Footer Styles
const footerStyle = { background: '#0f172a', color: '#fff', padding: '80px 8% 40px 8%' };
const footerMain = { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' };
const footerBrand = { flex: '1', minWidth: '300px' };
const footerLinksGroup = { flex: '2', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '40px' };
const footerHeading = { fontSize: '16px', color: '#fff', marginBottom: '25px', fontWeight: 'bold' };
const footerList = { listStyle: 'none', padding: 0, margin: 0, color: '#94a3b8', fontSize: '14px' };
const footerBottom = { marginTop: '80px', paddingTop: '30px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' };
const socialLinks = { display: 'flex', gap: '15px' };

export default LandingPage;