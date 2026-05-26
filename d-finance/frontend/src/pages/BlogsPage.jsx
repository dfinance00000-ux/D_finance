import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import {
  FiArrowRight,
  FiClock,
  FiSearch,
  FiTrendingUp,
  FiCalendar,
} from 'react-icons/fi';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get('/blogs');
        setBlogs(res.data || []);
      } catch (err) {
        console.log('Static Mode');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    const cats = blogs.map((b) => b.category).filter(Boolean);
    return ['All', ...new Set(cats)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title?.toLowerCase().includes(search.toLowerCase()) ||
        blog.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === 'All' || blog.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blogs, search, activeCategory]);

  return (
    <div style={pageWrapper}>
      {/* BACKGROUND GLOW */}
      <div style={glow1}></div>
      <div style={glow2}></div>

      {/* HERO */}
      <div style={heroSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={topBadge}>
            <FiTrendingUp />
            Financial Intelligence Hub
          </div>

          <h1 style={titleStyle}>
            Explore Premium <br />
            Financial Insights
          </h1>

          <p style={subTitle}>
            Discover market analysis, investment strategies, global finance
            trends, and regulatory updates — all in one premium dashboard.
          </p>

          {/* SEARCH */}
          <div style={searchWrapper}>
            <div style={searchBar}>
              <FiSearch color="#94a3b8" size={18} />
              <input
                placeholder="Search articles, reports, news..."
                style={inputStyle}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* CATEGORY FILTERS */}
      <div style={filterWrapper}>
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(cat)}
            style={{
              ...filterBtn,
              background:
                activeCategory === cat
                  ? 'linear-gradient(135deg,#3b82f6,#2563eb)'
                  : 'rgba(255,255,255,0.05)',
              border:
                activeCategory === cat
                  ? '1px solid #3b82f6'
                  : '1px solid rgba(255,255,255,0.08)',
              color: activeCategory === cat ? '#fff' : '#94a3b8',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FEATURED BLOG */}
      {!loading && filteredBlogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={featuredCard}
        >
          <div style={featuredLeft}>
            <span style={featuredTag}>FEATURED REPORT</span>

            <h2 style={featuredTitle}>{filteredBlogs[0].title}</h2>

            <p style={featuredDesc}>
              {filteredBlogs[0].description?.substring(0, 220)}...
            </p>

            <div style={featuredMeta}>
              <span style={metaItem}>
                <FiClock />
                8 min read
              </span>

              <span style={metaItem}>
                <FiCalendar />
                Latest Update
              </span>
            </div>

            <button
              style={heroBtn}
              onClick={() => setSelectedBlog(filteredBlogs[0])}
            >
              Read Full Report <FiArrowRight />
            </button>
          </div>

          <div style={featuredRight}>
            <div style={featuredImage}>📈</div>
          </div>
        </motion.div>
      )}

      {/* FULL BLOG VIEW */}
      {selectedBlog && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={fullBlogContainer}
        >
          <div style={fullBlogTop}>
            <span style={fullBlogTag}>
              {selectedBlog.category || 'ANALYSIS'}
            </span>

            <button
              style={closeBtn}
              onClick={() => setSelectedBlog(null)}
            >
              Close
            </button>
          </div>

          <h1 style={fullBlogTitle}>
            {selectedBlog.title}
          </h1>

          <p style={fullBlogDesc}>
            {selectedBlog.description}
          </p>

          <div style={blogContent}>
            {selectedBlog.content ||
              `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Vestibulum feugiat, sapien vel tincidunt tincidunt,
nunc erat ultricies nisi, sed consequat elit nisi ut arcu.

Donec euismod, nisl eget consectetur sagittis, nisl nunc
consectetur nisi, euismod aliquam nisl nunc eu nisi.

Financial technology and digital lending ecosystems are
transforming the modern economy with decentralized infrastructure,
blockchain security, and AI-driven analytics.
            `}
          </div>
        </motion.div>
      )}

      {/* BLOG GRID */}
      <div style={gridContainer}>
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} style={skeletonCard}></div>
            ))
          : filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                style={cardStyle}
              >
                <div style={cardTop}>
                  <span style={tagStyle}>
                    {blog.category || 'ANALYSIS'}
                  </span>

                  <span style={readTime}>
                    <FiClock size={12} />
                    5 min
                  </span>
                </div>

                <div style={iconCircle}>📊</div>

                <h3 style={blogTitle}>{blog.title}</h3>

                <p style={descStyle}>
                  {blog.description?.substring(0, 120)}...
                </p>

                <div style={cardFooter}>
                  <button
                    style={btnStyle}
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Read More
                    <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            ))}
      </div>

      {!loading && filteredBlogs.length === 0 && (
        <div style={emptyState}>
          <h2>No Reports Found</h2>
          <p>Try searching with different keywords.</p>
        </div>
      )}
    </div>
  );
};

// ---------------- STYLES ----------------

const pageWrapper = {
  minHeight: '100vh',
  background: '#020617',
  padding: '50px 5% 100px',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
};

const glow1 = {
  position: 'absolute',
  width: '400px',
  height: '400px',
  background: '#2563eb',
  filter: 'blur(180px)',
  top: '-120px',
  left: '-100px',
  opacity: 0.25,
};

const glow2 = {
  position: 'absolute',
  width: '350px',
  height: '350px',
  background: '#7c3aed',
  filter: 'blur(180px)',
  bottom: '0',
  right: '-100px',
  opacity: 0.2,
};

const heroSection = {
  maxWidth: '1200px',
  margin: '0 auto',
  textAlign: 'center',
  position: 'relative',
  zIndex: 2,
};

const topBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(59,130,246,0.12)',
  border: '1px solid rgba(59,130,246,0.3)',
  color: '#60a5fa',
  padding: '10px 18px',
  borderRadius: '50px',
  fontSize: '14px',
  fontWeight: '700',
  marginBottom: '30px',
};

const titleStyle = {
  fontSize: '72px',
  lineHeight: '1.05',
  fontWeight: '950',
  marginBottom: '25px',
  letterSpacing: '-3px',
};

const subTitle = {
  color: '#94a3b8',
  fontSize: '18px',
  maxWidth: '760px',
  margin: '0 auto',
  lineHeight: '1.8',
};

const searchWrapper = {
  marginTop: '40px',
  display: 'flex',
  justifyContent: 'center',
};

const searchBar = {
  width: '100%',
  maxWidth: '600px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '18px 22px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  backdropFilter: 'blur(20px)',
};

const inputStyle = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  width: '100%',
  color: '#fff',
  fontSize: '15px',
};

const filterWrapper = {
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: '50px',
  marginBottom: '50px',
};

const filterBtn = {
  padding: '12px 22px',
  borderRadius: '14px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '14px',
  transition: '0.3s',
  backdropFilter: 'blur(12px)',
};

const featuredCard = {
  maxWidth: '1200px',
  margin: '0 auto 60px',
  background:
    'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '35px',
  padding: '50px',
  display: 'grid',
  gridTemplateColumns: '1.3fr 0.7fr',
  gap: '40px',
  alignItems: 'center',
};

const featuredLeft = {};

const featuredTag = {
  display: 'inline-block',
  background: 'rgba(59,130,246,0.12)',
  color: '#60a5fa',
  padding: '8px 14px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '800',
  marginBottom: '20px',
};

const featuredTitle = {
  fontSize: '42px',
  fontWeight: '950',
  marginBottom: '20px',
  lineHeight: '1.2',
};

const featuredDesc = {
  color: '#94a3b8',
  lineHeight: '1.8',
  marginBottom: '25px',
};

const featuredMeta = {
  display: 'flex',
  gap: '25px',
  marginBottom: '30px',
  flexWrap: 'wrap',
};

const metaItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#94a3b8',
  fontSize: '14px',
};

const heroBtn = {
  background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  border: 'none',
  color: '#fff',
  padding: '16px 28px',
  borderRadius: '16px',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontSize: '15px',
};

const featuredRight = {
  display: 'flex',
  justifyContent: 'center',
};

const featuredImage = {
  width: '260px',
  height: '260px',
  borderRadius: '35px',
  background:
    'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))',
  border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '90px',
};

const fullBlogContainer = {
  maxWidth: '1200px',
  margin: '0 auto 60px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '35px',
  padding: '50px',
  backdropFilter: 'blur(20px)',
};

const fullBlogTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '25px',
};

const fullBlogTag = {
  background: 'rgba(59,130,246,0.12)',
  color: '#60a5fa',
  padding: '10px 18px',
  borderRadius: '12px',
  fontWeight: '800',
  fontSize: '13px',
};

const closeBtn = {
  background: '#ef4444',
  border: 'none',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '700',
};

const fullBlogTitle = {
  fontSize: '52px',
  fontWeight: '950',
  lineHeight: '1.2',
  marginBottom: '25px',
};

const fullBlogDesc = {
  fontSize: '18px',
  color: '#94a3b8',
  lineHeight: '1.9',
  marginBottom: '30px',
};

const blogContent = {
  color: '#e2e8f0',
  lineHeight: '2',
  fontSize: '17px',
  whiteSpace: 'pre-line',
};

const gridContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: '30px',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
};

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '28px',
  padding: '30px',
  backdropFilter: 'blur(20px)',
  transition: '0.4s',
};

const cardTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '25px',
};

const iconCircle = {
  width: '60px',
  height: '60px',
  borderRadius: '18px',
  background: 'rgba(59,130,246,0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  marginBottom: '20px',
};

const tagStyle = {
  fontSize: '11px',
  fontWeight: '900',
  color: '#60a5fa',
  background: 'rgba(59,130,246,0.1)',
  padding: '7px 14px',
  borderRadius: '10px',
};

const readTime = {
  fontSize: '12px',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const blogTitle = {
  fontSize: '25px',
  fontWeight: '900',
  marginBottom: '16px',
  lineHeight: '1.3',
};

const descStyle = {
  fontSize: '15px',
  color: '#94a3b8',
  lineHeight: '1.8',
  marginBottom: '30px',
};

const cardFooter = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const btnStyle = {
  background: '#fff',
  color: '#020617',
  border: 'none',
  padding: '13px 20px',
  borderRadius: '14px',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
};

const skeletonCard = {
  height: '320px',
  borderRadius: '28px',
  background: 'rgba(255,255,255,0.05)',
  animation: 'pulse 1.5s infinite',
};

const emptyState = {
  textAlign: 'center',
  marginTop: '100px',
  color: '#94a3b8',
};

export default BlogsPage;