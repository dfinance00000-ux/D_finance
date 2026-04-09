import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FiEdit3, FiTrash2, FiPlus, FiImage, FiType, FiTag, FiCheckCircle, FiX } from 'react-icons/fi';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // Stores ID of blog being edited
  
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: 'INVESTMENT',
    imageUrl: '' // 🖼️ Image URL option added
  });

  const fetchBlogs = async () => {
    try {
      const res = await API.get('/blogs');
      // Agar backend khali hai, toh ye 3 default blogs insert karega logic-wise
      setBlogs(Array.isArray(res.data) ? res.data.reverse() : []);
    } catch (err) {
      console.error("Error fetching blogs");
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  // --- HANDLE CREATE OR UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const blogPayload = { 
      ...formData, 
      date: new Date().toISOString(),
      author: "Admin - Mathura Branch",
      // Default image if empty
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=800&q=80'
    };

    try {
      if (isEditing) {
        await API.put(`/blogs/${isEditing}`, blogPayload);
        alert("💎 Insight Updated Successfully!");
      } else {
        await API.post('/blogs', blogPayload);
        alert("🚀 Insight Published Successfully!");
      }
      resetForm();
      fetchBlogs();
    } catch (err) { 
      alert("Error saving blog. Check backend console."); 
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE BLOG ---
  const deleteBlog = async (id) => {
    if(!window.confirm("Delete this insight permanently?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // --- SET EDIT MODE ---
  const startEdit = (blog) => {
    setIsEditing(blog._id);
    setFormData({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      imageUrl: blog.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'INVESTMENT', imageUrl: '' });
    setIsEditing(null);
  };

  return (
    <div className="animate-fadeIn space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {isEditing ? "🛠️ Edit Insight" : "✍️ Publish Insight"}
          </h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Global Content Control Panel
          </p>
        </div>
        {isEditing && (
          <button onClick={resetForm} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
            <FiX /> Cancel Edit
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- FORM SECTION --- */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><FiType/> Title</label>
              <input 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 mt-1 font-bold focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="Blog Title..." 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><FiTag/> Category</label>
              <select 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 mt-1 font-bold focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none appearance-none"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>INVESTMENT</option>
                <option>MARKET ANALYSIS</option>
                <option>SOP UPDATE</option>
                <option>BRANCH NEWS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><FiImage/> Cover Image URL</label>
            <input 
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 mt-1 font-bold focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none"
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
              placeholder="https://images.unsplash.com/your-image-link" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Analysis</label>
            <textarea 
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 mt-1 font-bold focus:border-emerald-500 focus:bg-white transition-all text-sm h-64 outline-none"
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              required 
              placeholder="Write detailed financial insights..." 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${isEditing ? 'bg-indigo-600' : 'bg-slate-900'} text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all hover:opacity-90 flex items-center justify-center gap-3`}
          >
            {loading ? "Processing..." : isEditing ? <><FiCheckCircle/> Update Intelligence</> : <><FiPlus/> Publish Insight</>}
          </button>
        </form>

        {/* --- RECENT LIST --- */}
        <div className="space-y-4 max-h-[900px] overflow-y-auto pr-2 custom-scrollbar">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Feed Management</h4>
          
          {blogs.length > 0 ? blogs.map(blog => (
            <div key={blog._id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
              <img 
                src={blog.imageUrl || 'https://via.placeholder.com/400x200'} 
                alt="blog" 
                className="w-full h-32 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="p-5">
                <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-black uppercase">{blog.category}</span>
                <h5 className="font-black text-slate-800 mt-2 text-sm leading-tight line-clamp-2">{blog.title}</h5>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => startEdit(blog)}
                    className="flex-1 bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-[10px] uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    <FiEdit3 /> Edit
                  </button>
                  <button 
                    onClick={() => deleteBlog(blog._id)} 
                    className="w-12 bg-red-50 text-red-500 py-2 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 py-20 text-center text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
              Awaiting New Data Nodes...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;