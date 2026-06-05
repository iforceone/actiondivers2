
import React from 'react';
import { Award, Users, Heart, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="bg-[#001219] min-h-screen text-center">
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <img 
          src="/images/gallery/SCUBA-and-Snorkelers-1.png" 
          alt="Belizean Coastal View" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001219]/80 via-transparent to-[#001219]"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 text-[#E9D8A6] tracking-tight">
            Our <span className="text-[#48CAE4]">Story</span>
          </h1>
          <p className="text-sm uppercase tracking-[0.5em] text-[#E9D8A6]/60">Action Divers & Adventures</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 space-y-16">
        <div className="space-y-10">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#E9D8A6] leading-tight">
            A Passion for the <span className="text-[#48CAE4] text-[#E9D8A6]/80">Caribbean Sea</span>
          </h2>
          <div className="space-y-8 text-xl font-light leading-relaxed text-[#E9D8A6]/80">
            <p>
              It’s time to get started on your Adventure! Known for our professionalism, knowledge and friendly service, 
              Action Divers and Adventures is your one-stop tour operator ready to help you create that unforgettable 
              fun-filled vacation.
            </p>
            <p>
              Our team is made up of licensed tour guides each with several years of experience. We do our best to 
              assist all our guest in whatever their needs are. We invite you to discover Belize through our 
              expertise—where safety meets the thrill of exploration.
            </p>
            <p>
              We invite you to review our website and if there is any questions that you may have please feel free 
              to contact us by way of our contact form or our telephone number provided.
            </p>
          </div>
          
          <div className="pt-10 flex flex-col items-center gap-4">
            <a 
              href="tel:0115016712624" 
              className="inline-flex items-center space-x-4 bg-[#E9D8A6] text-[#001219] px-12 py-5 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>011-501-671-2624</span>
            </a>
            <p className="text-[10px] uppercase tracking-widest text-[#E9D8A6]/40">Call us to plan your bespoke itinerary</p>
          </div>
        </div>

        <div className="relative pt-12">
          <div className="glass p-5 rounded-[3rem] transition-transform duration-700 hover:scale-[1.02]">
            <img 
              src="/images/gallery/Divers-Pointing-768x432.png" 
              alt="Action Divers Team" 
              className="rounded-[2.5rem] shadow-2xl w-full aspect-video object-cover"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass px-12 py-8 rounded-[2rem] border border-white/20 shadow-2xl whitespace-nowrap">
              <p className="text-5xl font-extrabold tracking-tight text-[#E9D8A6] mb-2">20+</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#E9D8A6]/60">Years of Elite Experience</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16">
            <div className="space-y-8 group">
              <div className="w-24 h-24 bg-[#005F73]/20 rounded-full flex items-center justify-center mx-auto border border-[#005F73]/40 group-hover:bg-[#005F73]/30 transition-all">
                <Award className="w-10 h-10 text-[#E9D8A6]" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight text-[#E9D8A6]">Professionalism</h3>
              <p className="text-[#E9D8A6]/60 leading-relaxed font-light text-lg">
                Our guides are fully licensed and committed to the highest standards of safety and service quality.
              </p>
            </div>
            <div className="space-y-8 group">
              <div className="w-24 h-24 bg-[#005F73]/20 rounded-full flex items-center justify-center mx-auto border border-[#005F73]/40 group-hover:bg-[#005F73]/30 transition-all">
                <Users className="w-10 h-10 text-[#E9D8A6]" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight text-[#E9D8A6]">Local Knowledge</h3>
              <p className="text-[#E9D8A6]/60 leading-relaxed font-light text-lg">
                With years of local experience, we know the secret canyons and hidden trails that typical tours miss.
              </p>
            </div>
            <div className="space-y-8 group">
              <div className="w-24 h-24 bg-[#005F73]/20 rounded-full flex items-center justify-center mx-auto border border-[#005F73]/40 group-hover:bg-[#005F73]/30 transition-all">
                <Heart className="w-10 h-10 text-[#E9D8A6]" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight text-[#E9D8A6]">Friendly Service</h3>
              <p className="text-[#E9D8A6]/60 leading-relaxed font-light text-lg">
                We make friends with our customers. Our warm hospitality keeps our guests returning year after year.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto glass p-20 rounded-[4rem] border border-white/10 shadow-3xl">
          <h2 className="text-5xl font-extrabold tracking-tight text-[#E9D8A6] mb-10 leading-tight">Ready to begin your <span className="text-[#48CAE4]">extraordinary</span> journey?</h2>
          <p className="text-[#E9D8A6]/60 mb-14 text-xl font-light">
            Let us help you design the perfect itinerary for your bespoke Belizean getaway.
          </p>
          <Link 
            to="/reservations" 
            className="inline-block bg-[#E9D8A6] text-[#001219] px-16 py-6 rounded-full font-bold uppercase tracking-[0.3em] hover:bg-white transition-all shadow-2xl active:scale-95"
          >
            Inquire Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
