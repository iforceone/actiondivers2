import React from 'react';
import { Heart, Phone, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const journey = [
  { year: '1994', detail: 'Made San Pedro home' },
  { year: '1996', detail: 'Began working in Belize tourism' },
  { year: '1998', detail: 'Earned his first Open Water certification' },
  { year: '2009', detail: 'Founded Action Divers' },
  { year: '2011', detail: 'Became a PADI Dive Instructor' },
  { year: 'Today', detail: 'Still diving, teaching and personally welcoming guests to Ambergris Caye' },
];

const differences = [
  {
    title: 'Small Groups',
    description: 'More space, less rushing, and more time with your guide.',
    icon: Users,
  },
  {
    title: 'Personal Attention',
    description: 'Instruction and trips adapted to the people actually on the boat.',
    icon: Sparkles,
  },
  {
    title: 'Belizean Hospitality',
    description: "Guests aren't treated like booking numbers.",
    icon: Heart,
  },
];

const About: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#001219] text-[#F8F4E8]">
      <SEO
        title="About Action Divers & Roberto Castillo"
        description="Meet Action Divers founder and PADI Dive Instructor Roberto Castillo, and discover the personal approach behind our Belize diving and adventure experiences."
        path="/about"
      />

      <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden text-center">
        <img
          src="/images/gallery/SCUBA-and-Snorkelers-1.png"
          alt="Divers and snorkelers enjoying the Caribbean Sea in Belize"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001219]/85 via-[#001219]/30 to-[#001219]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.32em] text-[#8DE7EF] sm:text-sm">
            Action Divers & Adventures
          </p>
          <h1 className="text-6xl font-extrabold tracking-[-0.045em] text-[#F8F4E8] md:text-8xl">
            Our <span className="text-[#11C7D9]">Story</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-relaxed text-[#F8F4E8]/78 sm:text-xl">
            Founded in San Pedro in 2009, Action Divers grew from one local diver's belief that Belize adventures
            should feel personal, unhurried, and genuinely welcoming.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl sm:rounded-[3rem] sm:p-5">
              <img
                src="/images/gallery/Roberto-with-Student-e1673390226440-768x542.jpg"
                alt="Roberto Castillo teaching a scuba student in a pool in San Pedro, Belize"
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-[1.5rem] object-cover object-center sm:rounded-[2.5rem]"
              />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-2xl border border-white/15 bg-[#062a33]/95 px-6 py-4 text-left shadow-xl backdrop-blur sm:left-10 sm:px-8">
              <p className="font-extrabold text-[#E9D8A6]">Teaching is still part of the job</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#F8F4E8]/60">San Pedro, Ambergris Caye</p>
            </div>
          </div>

          <article className="pt-8 text-left lg:pt-0">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#11C7D9]">Founder & PADI Dive Instructor</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] sm:text-6xl">
              Meet Roberto Castillo
            </h2>
            <div className="mt-8 space-y-5 text-lg font-light leading-relaxed text-[#F8F4E8]/75">
              <p>
                Roberto Castillo's story in San Pedro began long before Action Divers. Originally from Orange Walk,
                Roberto moved to San Pedro in 1994 and began working in Belize's tourism industry in 1996. Two years
                later, he earned his first Open Water diving certification and discovered a passion that would
                eventually become both a career and a business.
              </p>
              <p>
                After years in tourism and diving, Roberto founded <strong className="font-semibold text-[#F8F4E8]">Action Divers in 2009</strong>,
                creating the kind of dive operation he believed guests deserved: smaller groups, personal attention,
                and a relaxed, welcoming experience.
              </p>
              <p>
                Roberto became a <strong className="font-semibold text-[#F8F4E8]">PADI Dive Instructor in 2011</strong> and remains an active instructor today.
                Whether introducing someone to diving for the first time or guiding experienced divers along the
                Belize Barrier Reef, he enjoys giving each guest the individual attention that can be difficult to
                find in larger groups.
              </p>
              <p>
                His favorite local dive sites include <strong className="font-semibold text-[#F8F4E8]">Mata Canyons</strong> and{' '}
                <strong className="font-semibold text-[#F8F4E8]">Renegade</strong>, both off the northern side of Ambergris Caye.
                Guests are just as likely to remember his warmth and natural hospitality—Roberto has a way of making
                visitors feel less like customers and more like friends.
              </p>
              <p className="border-l-2 border-[#11C7D9] pl-5 font-medium text-[#E9D8A6]">
                That personal approach remains at the heart of Action Divers today.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.035] px-6 py-24 sm:py-28" aria-labelledby="journey-title">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#11C7D9]">Three decades in Belize tourism</p>
            <h2 id="journey-title" className="mt-4 text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl">
              Roberto's Journey
            </h2>
          </div>

          <ol className="relative mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
            <div className="absolute left-1/2 top-5 hidden h-px w-[67%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#11C7D9]/55 to-transparent md:block" aria-hidden="true" />
            {journey.map((milestone) => (
              <li key={milestone.year} className="relative rounded-2xl border border-white/10 bg-[#062a33] px-6 pb-7 pt-9 text-center shadow-lg">
                <span className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#11C7D9]/60 bg-[#001219] px-4 py-2 text-sm font-extrabold text-[#8DE7EF] shadow-lg">
                  {milestone.year}
                </span>
                <p className="text-base font-medium leading-relaxed text-[#F8F4E8]/78">{milestone.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-28 sm:py-36" aria-labelledby="difference-title">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#11C7D9]">The personal approach</p>
            <h2 id="difference-title" className="mt-4 text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl">
              Why Action Divers Feels Different
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {differences.map(({ title, description, icon: Icon }) => (
              <article key={title} className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center transition-colors hover:border-[#11C7D9]/35 hover:bg-[#11C7D9]/[0.07] sm:p-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#11C7D9]/35 bg-[#11C7D9]/15 transition-colors group-hover:bg-[#11C7D9]/25">
                  <Icon className="h-8 w-8 text-[#F8F4E8]" aria-hidden="true" />
                </div>
                <h3 className="mt-7 text-2xl font-extrabold tracking-tight">{title}</h3>
                <p className="mt-4 text-lg font-light leading-relaxed text-[#F8F4E8]/65">{description}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-3xl text-center text-xl font-medium leading-relaxed text-[#E9D8A6]">
            Small groups. Personal attention. And the kind of Belizean hospitality that makes you feel like part of the family.
          </p>
        </div>
      </section>

      <section className="bg-white/[0.035] px-6 py-24 sm:py-28" aria-labelledby="crew-title">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 px-7 py-12 text-center sm:rounded-[3rem] sm:px-14 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#11C7D9]">The people guests meet</p>
          <h2 id="crew-title" className="mt-4 text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl">
            Meet the Action Divers Crew
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-[#F8F4E8]/65">
            Roberto works alongside a small core crew who share the same commitment to safe, personal, and welcoming
            experiences. Their profiles and photographs are coming soon.
          </p>
        </div>
      </section>

      <section className="px-6 py-28 sm:py-36">
        <div className="glass mx-auto max-w-4xl rounded-[2.5rem] border border-white/10 p-8 text-center shadow-2xl sm:p-16">
          <h2 className="text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">
            Ready to plan your <span className="text-[#11C7D9]">Belize adventure?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-[#F8F4E8]/65">
            Tell us your dates, group size, and the experiences you are interested in. We will help you choose the right options.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/reservations"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--brand-orange)] px-9 py-4 font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--brand-orange-light)]"
            >
              Plan a Trip
            </Link>
            <a
              href="tel:0115016712624"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/15 px-8 py-4 font-bold text-[#F8F4E8] transition-colors hover:border-[#11C7D9]/50 hover:bg-white/5"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              011-501-671-2624
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
