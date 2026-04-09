import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', category: 'INVESTMENT' });
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await API.get('/blogs'); // 🚀 API path updated to use your axios instance
      setBlogs(Array.isArray(res.data) ? res.data.reverse() : []);
    } catch (err) {
      console.error("Error fetching blogs");
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const blogData = { 
      ...newBlog, 
      date: new Date().toISOString(),
      author: "Admin - Mathura Branch"
    };

    try {
      await API.post('/blogs', blogData);
      alert("🚀 Insight Published Successfully!");
      setNewBlog({ title: '', content: '', category: 'INVESTMENT' });
      fetchBlogs();
    } catch (err) { 
      alert("Error publishing blog. Ensure your backend route /blogs is ready."); 
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    if(!window.confirm("Delete this insight permanently?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">✍️ Investor Insights</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Publish market updates & SOPs</p>
        </div>
        <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Live on Landing Page</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Form Section --- */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Insight Title</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              value={newBlog.title} 
              onChange={e => setNewBlog({...newBlog, title: e.target.value})} 
              required 
              placeholder="e.g. Gold Loan Market Trends 2026" 
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
            <select 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-sm appearance-none"
              value={newBlog.category} 
              onChange={e => setNewBlog({...newBlog, category: e.target.value})}
            >
              <option>INVESTMENT</option>
              <option>MARKET ANALYSIS</option>
              <option>SOP UPDATE</option>
              <option>BRANCH NEWS</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Content</label>
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-sm h-40"
              value={newBlog.content} 
              onChange={e => setNewBlog({...newBlog, content: e.target.value})} 
              required 
              placeholder="Deep dive into your professional analysis..." 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/20 active:scale-95 transition-all hover:bg-emerald-600"
          >
            {loading ? "Publishing..." : "🚀 Publish to Landing Page"}
          </button>
        </form>

        {/* --- List Section --- */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 max-h-[600px] overflow-y-auto">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Recently Published</h4>
          
          <div className="space-y-4">
            {blogs.length > 0 ? blogs.map(blog => (
              <div key={blog._id} className="bg-white p-5 rounded-2xl flex justify-between items-center border border-slate-100 group hover:border-emerald-500 transition-all">
                <div className="pr-4">
                  <span className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md font-black uppercase">{blog.category}</span>
                  <p className="font-bold text-slate-800 mt-1 text-sm group-hover:text-emerald-600 transition-colors leading-tight">{blog.title}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase">{new Date(blog.date).toLocaleDateString()} | {blog.author}</p>
                </div>
                <button 
                  onClick={() => deleteBlog(blog._id)} 
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  🗑️
                </button>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-300 font-bold uppercase italic text-[10px] tracking-widest">
                No insights found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;