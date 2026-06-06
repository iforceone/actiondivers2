import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Tag } from 'lucide-react';
import SEO, { SITE_URL } from '../components/SEO';
import { BLOG_POSTS } from '../data/blogPosts';
import { INITIAL_TOURS } from '../constants';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    return (
      <div className="pt-48 pb-32 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <SEO
          title="Blog Post Not Found"
          description="This Action Divers & Adventures blog post could not be found."
          path={`/blog/${slug || ''}`}
          noindex
        />
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-[#E9D8A6]">Chronicle not found.</h1>
        <Link to="/blog" className="text-[#48CAE4] font-bold uppercase tracking-widest">Return to Voyage Chronicles</Link>
      </div>
    );
  }

  const relatedTours = INITIAL_TOURS.filter((tour) => post.relatedTours.includes(tour.id));
  const relatedPosts = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 2);
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `${SITE_URL}${post.image}`,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Action Divers & Adventures',
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Voyage Chronicles', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <article className="pt-20 bg-[#001219]">
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.image}
        type="article"
        structuredData={[articleStructuredData, breadcrumbStructuredData]}
      />
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001219] via-[#001219]/50 to-[#001219]/40"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
          <Link to="/blog" className="inline-flex items-center text-[#E9D8A6]/50 hover:text-[#E9D8A6] text-xs font-bold uppercase tracking-[0.3em] mb-10">
            <ArrowLeft className="w-4 h-4 mr-3" /> Voyage Chronicles
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.35em] text-[#48CAE4] font-bold mb-6">
            <span className="inline-flex items-center"><Calendar className="w-4 h-4 mr-2" /> {post.date}</span>
            <span>{post.author}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#E9D8A6] leading-tight mb-8">{post.title}</h1>
          <p className="text-xl md:text-2xl text-[#E9D8A6]/75 font-light leading-relaxed max-w-3xl">{post.excerpt}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-[1fr_280px] gap-16">
          <div className="space-y-8">
            {post.body.map((paragraph) => (
              <p key={paragraph} className="text-xl leading-relaxed text-[#E9D8A6]/80 font-light">
                {paragraph}
              </p>
            ))}

            {relatedTours.length > 0 && (
              <section className="mt-16 glass p-8 rounded-[2rem] border border-white/5">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#E9D8A6] mb-6">Related Adventures</h2>
                <div className="space-y-4">
                  {relatedTours.map((tour) => (
                    <Link key={tour.id} to={`/tour/${tour.id}`} className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span>
                        <span className="block text-[#E9D8A6] font-bold">{tour.name}</span>
                        <span className="block text-[#E9D8A6]/50 text-sm mt-1">{tour.description}</span>
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#48CAE4] shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <div className="glass p-7 rounded-[2rem] border border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#E9D8A6]/50 mb-5">Topics</h2>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-widest text-[#E9D8A6]/70">
                    <Tag className="w-3 h-3 mr-2 text-[#48CAE4]" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass p-7 rounded-[2rem] border border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#E9D8A6]/50 mb-5">Read Next</h2>
              <div className="space-y-5">
                {relatedPosts.map((item) => (
                  <Link key={item.slug} to={`/blog/${item.slug}`} className="block text-[#E9D8A6]/70 hover:text-[#E9D8A6] transition-colors">
                    <span className="block font-bold leading-snug">{item.title}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-[#48CAE4] mt-2">{item.date}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
};

export default BlogPostPage;
