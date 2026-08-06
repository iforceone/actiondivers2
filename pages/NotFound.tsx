import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <section className="flex min-h-[78vh] items-center justify-center px-6 pb-24 pt-40 text-center">
      <SEO
        title="Page Not Found"
        description="The page you requested could not be found. Explore Action Divers & Adventures tours from San Pedro, Belize."
        path={pathname}
        noindex
      />
      <div className="mx-auto max-w-2xl">
        <Compass className="mx-auto h-12 w-12 text-[#11C7D9]" aria-hidden="true" />
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[#11C7D9]">404 · Off the chart</p>
        <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-[#F8F4E8] sm:text-7xl">This page drifted away.</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#F8F4E8]/70">
          The address may have changed, but the reef and mainland adventures are still here.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-orange)] px-8 py-3 font-bold text-white transition-colors hover:bg-[var(--brand-orange-light)]">
            Return Home
          </Link>
          <Link to="/island-adventures" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-8 py-3 font-bold text-[#F8F4E8] transition-colors hover:border-[#11C7D9]/60 hover:bg-white/5">
            Explore Tours <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
