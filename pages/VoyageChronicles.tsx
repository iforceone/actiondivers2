
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Anchor } from 'lucide-react';

const POSTS_PER_PAGE = 6;

const VoyageChronicles: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('action_divers_logs');
    if (stored) {
      setLogs(JSON.parse(stored));
    }
  }, []);

  const totalPages = Math.ceil(logs.length / POSTS_PER_PAGE);
  const currentLogs = logs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  if (logs.length === 0) {
    return (
      <div className="pt-48 pb-32 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Anchor className="w-16 h-16 text-[#005F73] mb-8 opacity-20 animate-pulse" />
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#E9D8A6]">Voyage <span className="text-[#48CAE4]">Chronicles</span></h1>
        <p className="text-[#E9D8A6]/40 text-[#48CAE4] uppercase tracking-[0.4em] text-sm mb-12">The sea has yet to speak</p>
        <div className="glass p-12 rounded-[3rem] border border-white/5 max-w-md">
           <p className="text-xl font-light text-[#E9D8A6]/60 leading-relaxed">
            No chronicles have been posted yet. Our captains are currently out at sea gathering stories of the blue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 max-w-7xl mx-auto px-6">
      <div className="text-center mb-24">
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight mb-6 text-[#E9D8A6]">Voyage <span className="text-[#48CAE4]">Chronicles</span></h1>
        <p className="text-[#E9D8A6]/60 text-[#48CAE4] uppercase tracking-[0.4em] text-sm">Stories from the Caribbean Sea</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {currentLogs.map((log) => (
          <article 
            key={log.id} 
            className="group glass rounded-[2.5rem] overflow-hidden flex flex-col h-full border border-white/5 hover:border-white/10 transition-all shadow-2xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={log.imageUrl || '/images/gallery/BBQ-Food-225x300.jpg'} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={log.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001219]/80 to-transparent"></div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <p className="text-[10px] text-[#005F73] font-bold uppercase tracking-[0.4em] mb-4">{log.date}</p>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#E9D8A6] mb-4 group-hover:text-white transition-colors line-clamp-2">
                {log.title}
              </h2>
              <p className="text-[#E9D8A6]/60 leading-relaxed font-light text-sm line-clamp-3 mb-8">
                {log.content}
              </p>
              <div className="mt-auto pt-6 border-t border-white/5">
                <button 
                  onClick={() => setSelectedLog(log)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E9D8A6]/40 hover:text-[#E9D8A6] transition-all flex items-center group/btn"
                >
                  Read Chronicle <ChevronRight className="ml-2 w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center items-center space-x-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-4 rounded-full glass disabled:opacity-20 hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#E9D8A6]/40">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-4 rounded-full glass disabled:opacity-20 hover:bg-white/5 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Full Screen Reading Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001219]/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] glass rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10">
            <button 
              onClick={() => setSelectedLog(null)}
              className="absolute top-8 right-8 z-10 p-3 rounded-full glass hover:bg-white/10 text-[#E9D8A6] transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="relative h-[400px]">
                <img 
                  src={selectedLog.imageUrl} 
                  className="w-full h-full object-cover" 
                  alt={selectedLog.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001219] to-transparent"></div>
              </div>
              
              <div className="p-12 md:p-20 pt-10">
                <p className="text-xs text-[#005F73] font-bold uppercase tracking-[0.5em] mb-6">{selectedLog.date}</p>
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#E9D8A6] mb-12 leading-tight">{selectedLog.title}</h2>
                <div className="text-xl font-light text-[#E9D8A6]/80 leading-relaxed space-y-8 whitespace-pre-wrap">
                  {selectedLog.content}
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t border-white/5 text-center">
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#E9D8A6]/40 hover:text-[#E9D8A6]"
              >
                Return to Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoyageChronicles;
