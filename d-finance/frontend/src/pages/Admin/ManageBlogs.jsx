import React, { useState, useEffect } from 'react';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', category: 'INVESTMENT' });

  const fetchBlogs = async () => {
    const res = await fetch('http://localhost:5000/blogs');
    const data = await res.json();
    setBlogs(data.reverse());
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const blogData = { 
      ...newBlog, 
      date: new Date().toISOString(),
      id: Date.now().toString() 
    };

    try {
      await fetch('http://localhost:5000/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });
      alert("Insight Published Successfully!");
      setNewBlog({ title: '', content: '', category: 'INVESTMENT' });
      fetchBlogs();
    } catch (err) { alert("Error publishing blog."); }
  };

  const deleteBlog = async (id) => {
    if(!window.confirm("Delete this insight?")) return;
    await fetch(`http://localhost:5000/blogs/${id}`, { method: 'DELETE' });
    fetchBlogs();
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ color: '#059669', marginBottom: '20px' }}>✍️ Manage Investor Insights</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Form Section */}
        <form onSubmit={handleSubmit} style={formCard}>
          <label style={labelStyle}>INSIGHT TITLE</label>
          <input style={inputStyle} value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} required placeholder="e.g. Quarterly Growth Report" />
          
          <label style={labelStyle}>CATEGORY</label>
          <select style={inputStyle} value={newBlog.category} onChange={e => setNewBlog({...newBlog, category: e.target.value})}>
            <option>INVESTMENT</option>
            <option>MARKET ANALYSIS</option>
            <option>SOP UPDATE</option>
          </select>

          <label style={labelStyle}>CONTENT</label>
          <textarea style={{...inputStyle, height: '150px'}} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} required placeholder="Write your professional insight here..." />
          
          <button type="submit" style={submitBtn}>Publish to Landing Page</button>
        </form>

        {/* List Section */}
        <div style={listContainer}>
          <h4 style={{marginTop: 0}}>Published Insights</h4>
          {blogs.map(blog => (
            <div key={blog.id} style={blogItem}>
              <div>
                <span style={tagStyle}>{blog.category}</span>
                <p style={{fontWeight: 'bold', margin: '5px 0'}}>{blog.title}</p>
              </div>
              <button onClick={() => deleteBlog(blog.id)} style={delBtn}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const formCard = { background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', margin: '8px 0 20px 0', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#64748b' };
const submitBtn = { width: '100%', padding: '15px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const listContainer = { background: '#f8fafc', padding: '20px', borderRadius: '15px', maxHeight: '500px', overflowY: 'auto' };
const blogItem = { background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' };
const tagStyle = { fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' };
const delBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' };

export default ManageBlogs;