import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Grid3x3, ImageOff, List, Share2, X } from 'lucide-react';
import { GALLERY_IMAGES } from '../utils/imageOptimization';
import { GalleryImage } from '../types';

const INITIAL_VISIBLE = 16;
const LOAD_STEP = 12;

const categories = [
  { value: 'all', label: 'All' },
  { value: 'diving', label: 'Diving' },
  { value: 'snorkeling', label: 'Snorkeling' },
  { value: 'fishing', label: 'Fishing' },
  { value: 'boating', label: 'On the Water' },
  { value: 'mainland', label: 'Mainland' },
  { value: 'dining', label: 'Food & BBQ' },
  { value: 'nature', label: 'Wildlife' },
];

const cleanTitle = (title: string) => {
  const named: Record<string, string> = {
    '12 29': 'Snorkeling the Belize Barrier Reef',
    '20221112 115550 Original 768x576': 'Fresh Lobster Catch',
    'IMG 5824 E1673406815998 768x576': 'Welcome to Belize',
    'Screenshot 96': 'Lionfish on the Reef',
    'Deep Sea Meter': 'Dive Instruments',
    'SCUBA And Snorkelers 1': 'Reef Adventure',
    'WhatsApp Image 2026 03 01 At 8.51.09 PM': 'Lunch After a Day on the Water',
    'WhatsApp Image 2026 03 01 At 8.51.09 PM 1': 'Belizean Family-Style Lunch',
    'WhatsApp Image 2026 03 01 At 8.51.10 PM': 'Sharing a Local Meal',
    'WhatsApp Image 2026 03 01 At 8.51.10 PM 1': 'Guests Around the Table',
    'WhatsApp Image 2026 03 01 At 8.51.10 PM 2': 'A Taste of Belize',
  };
  if (named[title]) return named[title];
  return title
    .replace(/\b(?:e?\d{9,}|\d{3,4}x\d{3,4})\b/gi, '')
    .replace(/\b(?:Original|WhatsApp Image|Web)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const filteredImages = useMemo(
    () => GALLERY_IMAGES.filter((image) => selectedCategory === 'all' || image.category === selectedCategory),
    [selectedCategory],
  );
  const visibleImages = filteredImages.slice(0, visibleCount);
  const selectedIndex = selectedImage ? filteredImages.findIndex((image) => image.id === selectedImage.id) : -1;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null);
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedImage, selectedIndex, filteredImages]);

  const showPrevious = () => {
    if (!filteredImages.length) return;
    const nextIndex = selectedIndex <= 0 ? filteredImages.length - 1 : selectedIndex - 1;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const showNext = () => {
    if (!filteredImages.length) return;
    const nextIndex = selectedIndex >= filteredImages.length - 1 ? 0 : selectedIndex + 1;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const shareImage = async (image: GalleryImage) => {
    const imageUrl = new URL(image.src, window.location.origin).href;
    if (navigator.share) {
      try {
        await navigator.share({ title: cleanTitle(image.title), text: image.alt, url: imageUrl });
      } catch {
        // The native share sheet was dismissed.
      }
    } else {
      await navigator.clipboard.writeText(imageUrl);
    }
  };

  const downloadImage = (image: GalleryImage) => {
    const link = document.createElement('a');
    const extension = image.src.split('.').pop()?.split('?')[0] || 'jpg';
    link.href = image.src;
    link.download = `${cleanTitle(image.title).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-[#001219] text-[#F8F4E8] pt-20">
      <header className="border-b border-white/10 bg-[#001219]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.45em] text-[#11C7D9]">Life in Belize</p>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">Gallery</h1>
              <p className="mt-3 max-w-2xl text-[#F8F4E8]/60">Reef days, fishing stories, mainland adventures, and good meals shared with our guests.</p>
            </div>
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <span className="text-sm text-[#F8F4E8]/50">{filteredImages.length} photos</span>
              <div className="flex rounded-lg border border-white/15 bg-white/5 p-1">
                <button type="button" onClick={() => setViewMode('grid')} aria-label="Square grid view" aria-pressed={viewMode === 'grid'} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'rounded-md bg-[var(--brand-orange)] text-white' : 'text-[#F8F4E8]/50 hover:text-white'}`}>
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setViewMode('masonry')} aria-label="Masonry view" aria-pressed={viewMode === 'masonry'} className={`p-2.5 transition-colors ${viewMode === 'masonry' ? 'rounded-md bg-[var(--brand-orange)] text-white' : 'text-[#F8F4E8]/50 hover:text-white'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter gallery by category">
            {categories.map((category) => (
              <button key={category.value} type="button" onClick={() => setSelectedCategory(category.value)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${selectedCategory === category.value ? 'border-[#11C7D9] bg-[#11C7D9] text-[#001219]' : 'border-white/15 bg-white/5 text-[#F8F4E8]/60 hover:border-[#11C7D9]/60 hover:text-white'}`}>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4'}>
          {visibleImages.map((image, index) => {
            const failed = failedImages.has(image.src);
            const loaded = loadedImages.has(image.src);
            return (
              <button key={image.id} type="button" onClick={() => !failed && setSelectedImage(image)} className={`group relative mb-4 block w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left ${viewMode === 'grid' ? 'aspect-[4/3]' : 'break-inside-avoid'} ${failed ? 'cursor-default' : 'cursor-zoom-in'}`}>
                {!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-white/5" />}
                {failed ? (
                  <span className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center text-[#F8F4E8]/45">
                    <ImageOff className="h-7 w-7" />
                    <span className="text-xs uppercase tracking-widest">Photo unavailable</span>
                  </span>
                ) : (
                  <img src={image.src} alt={image.alt} loading={index < 6 ? 'eager' : 'lazy'} decoding="async" className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${viewMode === 'grid' ? 'h-full' : 'h-auto'} ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoadedImages((previous) => new Set(previous).add(image.src))} onError={() => setFailedImages((previous) => new Set(previous).add(image.src))} />
                )}
                {!failed && <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5 pt-16 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0"><span className="block font-bold text-white">{cleanTitle(image.title)}</span><span className="mt-1 block text-xs capitalize text-white/65">{categories.find((category) => category.value === image.category)?.label || image.category}</span></span>}
              </button>
            );
          })}
        </div>

        {visibleCount < filteredImages.length && (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setVisibleCount((count) => count + LOAD_STEP)} className="rounded-full bg-[var(--brand-orange)] px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[var(--brand-orange-light)]">Load More Photos</button>
            <p className="mt-3 text-xs text-[#F8F4E8]/40">Showing {visibleImages.length} of {filteredImages.length}</p>
          </div>
        )}
      </main>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={cleanTitle(selectedImage.title)} onClick={() => setSelectedImage(null)}>
          <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Close image"><X className="h-6 w-6" /></button>
          <button type="button" onClick={(event) => { event.stopPropagation(); showPrevious(); }} className="absolute left-3 z-20 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8" aria-label="Previous image"><ChevronLeft className="h-7 w-7" /></button>
          <button type="button" onClick={(event) => { event.stopPropagation(); showNext(); }} className="absolute right-3 z-20 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8" aria-label="Next image"><ChevronRight className="h-7 w-7" /></button>
          <div className="flex max-h-[92vh] max-w-6xl flex-col items-center" onClick={(event) => event.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} className="max-h-[72vh] max-w-full rounded-xl object-contain" />
            <div className="mt-5 text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-[#11C7D9]">{selectedIndex + 1} / {filteredImages.length}</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{cleanTitle(selectedImage.title)}</h2>
              <div className="mt-4 flex justify-center gap-3">
                <button type="button" onClick={() => shareImage(selectedImage)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"><Share2 className="h-4 w-4" /> Share</button>
                <button type="button" onClick={() => downloadImage(selectedImage)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"><Download className="h-4 w-4" /> Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
