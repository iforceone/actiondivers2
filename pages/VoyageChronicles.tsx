
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Anchor, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO, { SITE_URL } from '../components/SEO';
import { BLOG_POSTS } from '../data/blogPosts';

const POSTS_PER_PAGE = 6;

const VoyageChronicles: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE);
  const currentPosts = BLOG_POSTS.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Voyage Chronicles',
    url: `${SITE_URL}/blog`,
    description: 'Belize travel guides, snorkeling tips, scuba diving advice, and adventure planning from Action Divers & Adventures.',
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      author: { '@type': 'Organization', name: post.author },
    })),
  };

  return (
    <div className="pt-48 pb-32 max-w-7xl mx-auto px-6">
      <SEO
        title="Belize Travel Blog & Adventure Guides"
        description="Read Action Divers & Adventures guides to snorkeling, scuba diving, island tours, mainland expeditions, and family-friendly Belize activities from San Pedro."
        path="/blog"
        image="/images/gallery/Group-of-Snorkelers-with-fish-768x432.png"
        structuredData={structuredData}
      />
      <div className="text-center mb-24">
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight mb-6 text-[#E9D8A6]">Voyage <span className="text-[#48CAE4]">Chronicles</span></h1>
        <p className="text-[#E9D8A6]/60 text-[#48CAE4] uppercase tracking-[0.4em] text-sm">Stories from the Caribbean Sea</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {currentPosts.map((post) => (
          <article 
            key={post.slug}
            className="group glass rounded-[2.5rem] overflow-hidden flex flex-col h-full border border-white/5 hover:border-white/10 transition-all shadow-2xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={post.image}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={post.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001219]/80 to-transparent"></div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <p className="text-[10px] text-[#005F73] font-bold uppercase tracking-[0.4em] mb-4">{post.date}</p>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#E9D8A6] mb-4 group-hover:text-white transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-[#E9D8A6]/60 leading-relaxed font-light text-sm line-clamp-3 mb-8">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-6 border-t border-white/5">
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E9D8A6]/40 hover:text-[#E9D8A6] transition-all flex items-center group/btn"
                >
                  Read Chronicle <ArrowRight className="ml-2 w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
                </Link>
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
    </div>
  );
};

export default VoyageChronicles;
