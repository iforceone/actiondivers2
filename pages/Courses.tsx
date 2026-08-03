import React from 'react';
import { ArrowRight, BadgeCheck, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useBooking } from '../contexts/BookingContext';
import { formatUsd } from '../shared/bookingCatalog';

const Courses: React.FC = () => {
  const { catalog } = useBooking();
  const courses = catalog.items.filter((item) => item.active && item.category === 'Course').sort((a, b) => a.sortOrder - b.sortOrder);
  return <main className="bg-[#001219] text-[#F8F4E8]">
    <SEO title="Scuba Courses in Ambergris Caye, Belize" description="Compare Action Divers scuba courses, including Refresher, Discover Scuba Diving, Open Water options, Scuba Diver, and Advanced Open Water." path="/courses" image="/images/gallery/Roberto-with-Student-e1673390226440-768x542.jpg" />
    <section className="relative flex min-h-[650px] items-end overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-14">
      <img src="/images/gallery/Roberto-with-Student-e1673390226440-768x542.jpg" alt="An Action Divers instructor working with a scuba student" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001219] via-[#001219]/45 to-[#001219]/20" />
      <div className="relative mx-auto w-full max-w-7xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8DE7EF]">Learn and return to diving</p><h1 className="mt-5 max-w-4xl text-5xl font-extrabold tracking-[-0.045em] sm:text-7xl lg:text-8xl">Scuba courses for your next step.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#F8F4E8]/78">Choose the course that matches your experience. Staff will confirm prerequisites, schedule, and availability before your request becomes a booking.</p><div className="mt-6 inline-flex items-center gap-3 text-sm font-bold text-[#F8F4E8]"><BadgeCheck className="h-5 w-5 shrink-0 text-[#11C7D9]" aria-hidden="true" /><span>Courses taught by a PADI-certified instructor</span></div></div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-14">
      <div className="grid gap-x-12 gap-y-5 lg:grid-cols-2">{courses.map((course) => <article key={course.id} className="border-t border-white/14 py-7"><div className="flex items-start justify-between gap-5"><div><h2 className="text-2xl font-extrabold">{course.name}</h2>{course.id === 'course-discover' && <p className="mt-1 text-sm text-[#8DE7EF]">Also called a Resort Course</p>}</div><span className="shrink-0 font-bold text-[#F8F4E8]">{formatUsd(course.priceCents)}</span></div><p className="mt-4 leading-relaxed text-[#F8F4E8]/65">{course.id === 'course-refresher' ? 'For certified divers returning to the water after time away.' : course.id === 'course-discover' ? 'An introductory scuba experience for guests who are not yet certified.' : course.id === 'course-referral' ? 'A two-day option for guests completing eligible referral training; staff must review referral documents.' : course.id === 'course-owcert' ? 'The listed three-day Open Water certification course.' : course.id === 'course-advanced' ? 'Continuing training for divers ready to progress beyond Open Water.' : 'A scuba training option offered for guests building their diving experience.'}</p><Link to={`/courses/request?course=${course.id}`} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--brand-orange)] px-5 text-sm font-bold text-white">Request this course <ArrowRight className="ml-2 h-4 w-4" /></Link></article>)}</div>
      <div className="mt-16 flex flex-col gap-5 border-t border-white/14 pt-10 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><Waves className="mt-1 h-6 w-6 text-[#11C7D9]" /><p className="max-w-xl text-[#F8F4E8]/68">Courses are taught by a PADI-certified instructor. Course prerequisites, schedules, and individual eligibility are confirmed after reviewing your request.</p></div><Link to="/courses/request" className="inline-flex items-center font-bold text-[#8DE7EF]">Start a course request <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
    </section>
  </main>;
};
export default Courses;
