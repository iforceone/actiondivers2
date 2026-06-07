
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Plus, Trash2, Edit2, Save, Image as ImageIcon, Upload } from 'lucide-react';

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  
  // New/Editing Log Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load logs
    const storedLogs = localStorage.getItem('action_divers_logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  const saveLogsToStorage = (newLogs: any[]) => {
    setLogs(newLogs);
    localStorage.setItem('action_divers_logs', JSON.stringify(newLogs));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Barracuda' && password === 'Nurs3sh4rk') {
      setIsLoggedIn(true);
    } else {
      alert('Access Denied: Incorrect Credentials');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedLogs;
    if (editingId) {
      updatedLogs = logs.map(log => log.id === editingId ? { ...log, ...formData } : log);
      setEditingId(null);
    } else {
      const newLog = {
        ...formData,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      updatedLogs = [newLog, ...logs];
    }
    saveLogsToStorage(updatedLogs);
    setFormData({ title: '', content: '', imageUrl: '' });
  };

  const handleEdit = (log: any) => {
    setEditingId(log.id);
    setFormData({ title: log.title, content: log.content, imageUrl: log.imageUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      const updatedLogs = logs.filter(l => l.id !== id);
      saveLogsToStorage(updatedLogs);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#001219]">
        <div className="glass p-12 rounded-[3rem] w-full max-w-md border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#E9D8A6]">Owner <span className="text-[#48CAE4]">Login</span></h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#E9D8A6]/40 mt-2">Action Divers Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest ml-2 text-[#E9D8A6]/60">Username</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest ml-2 text-[#E9D8A6]/60">Password</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-[var(--brand-orange)] text-white font-bold py-5 rounded-full uppercase tracking-widest hover:bg-[var(--brand-orange-light)] transition-all shadow-xl active:scale-95">
              Open Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#E9D8A6]">Owner <span className="text-[#48CAE4]">Dashboard</span></h1>
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#E9D8A6]/40 mt-3">Action Divers & Adventures</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center space-x-3 text-[#E9D8A6]/40 hover:text-white transition-colors glass px-6 py-3 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#E9D8A6] flex items-center space-x-3">
          <div className="w-2 h-2 bg-[#005F73] rounded-full"></div>
          <span>Travel Guide Management</span>
        </h2>
        
        <div className="glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xl font-extrabold tracking-tight text-[#E9D8A6] mb-8">{editingId ? 'Edit Guide' : 'Post New Guide'}</h3>
          <form onSubmit={handleSaveLog} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#E9D8A6]/40 ml-1">Guide Title</label>
              <input 
                placeholder="Best Snorkeling Tours from San Pedro..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#E9D8A6]/40 ml-1">Cover Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.07] hover:border-[#E9D8A6]/20 transition-all overflow-hidden"
              >
                {formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Preview" />
                    <div className="relative z-10 flex flex-col items-center">
                      <Upload className="w-8 h-8 text-[#E9D8A6] mb-2" />
                      <span className="text-[10px] font-bold text-[#E9D8A6] uppercase tracking-widest">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-[#E9D8A6]/20 group-hover:text-[#E9D8A6]/40 mb-3" />
                    <span className="text-[10px] font-bold text-[#E9D8A6]/30 group-hover:text-[#E9D8A6]/50 uppercase tracking-[0.3em]">Click to upload capture</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#E9D8A6]/40 ml-1">Guide Content</label>
              <textarea 
                placeholder="Write helpful planning advice for Belize visitors..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#E9D8A6] h-48 focus:outline-none focus:border-[#E9D8A6]/40 leading-relaxed"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                required
              ></textarea>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-[var(--brand-orange)] text-white px-8 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--brand-orange-light)] transition-all shadow-xl flex items-center justify-center">
                {editingId ? <Save className="w-4 h-4 mr-3" /> : <Plus className="w-4 h-4 mr-3" />}
                {editingId ? 'Update Guide' : 'Publish Guide'}
              </button>
              {editingId && (
                 <button 
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({title:'', content:'', imageUrl:''}); }}
                  className="glass px-8 py-5 rounded-full text-[#E9D8A6]/60 border border-white/10 hover:text-white"
                 >
                   Cancel
                 </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#E9D8A6]/40 ml-1">Existing Guides</h3>
          {logs.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center border border-white/5">
              <p className="text-[#E9D8A6]/30 text-xs uppercase tracking-widest">No guides recorded yet.</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="glass p-6 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all shadow-xl">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                    <img src={log.imageUrl || '/images/gallery/Diver-1-768x432.png'} className="w-full h-full object-cover" alt="Blog" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#E9D8A6]">{log.title}</h4>
                    <p className="text-[10px] text-[#E9D8A6]/40 uppercase tracking-widest mt-1">{log.date}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleEdit(log)}
                    className="p-3 bg-white/5 rounded-full text-[#E9D8A6]/40 hover:text-[#E9D8A6] hover:bg-white/10 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(log.id)}
                    className="p-3 bg-red-500/10 rounded-full text-red-400/40 hover:text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
