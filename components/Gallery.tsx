import React, { useState, useEffect, useRef } from 'react';
import { X, Grid3x3, List, Search, Filter, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES, preloadImage, IMAGES_PER_PAGE, TOTAL_PAGES } from '../utils/imageOptimization';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  title: string;
}

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const categories = [
    { value: 'all', label: 'All Photos' },
    { value: 'diving', label: 'Diving' },
    { value: 'snorkeling', label: 'Snorkeling' },
    { value: 'fishing', label: 'Fishing' },
    { value: 'dining', label: 'Dining' },
    { value: 'mainland', label: 'Mainland' },
    { value: 'landscape', label: 'Landscapes' },
    { value: 'boating', label: 'Boating' },
    { value: 'nature', label: 'Nature' }
  ];

  const filteredImages = GALLERY_IMAGES.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Cleanup loaded images when page changes to fix navigation issues
  useEffect(() => {
    setLoadedImages(new Set());
  }, [currentPage]);

  // Lazy loading with intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src && !loadedImages.has(src)) {
              preloadImage(src).then(() => {
                img.src = src;
                setLoadedImages(prev => new Set([...prev, src]));
                img.classList.remove('loading');
              });
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadedImages]);

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  const shareImage = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: `Check out this amazing photo from Action Divers Belize: ${image.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const downloadImage = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `${image.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#001219] text-[#E9D8A6] pt-20">
      {/* Static Header */}
      <div className="bg-[#001219] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-2">Gallery</h1>
              <p className="text-[#E9D8A6]/60">Experience the beauty of Belize through our adventures</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-[#001219]">
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-white/10 border border-white/20 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-[var(--brand-orange)] text-white' : 'text-[#E9D8A6]/60 hover:text-[#E9D8A6]'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'masonry' ? 'bg-[var(--brand-orange)] text-white' : 'text-[#E9D8A6]/60 hover:text-[#E9D8A6]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-[#E9D8A6]/60">
            {filteredImages.length} photos {selectedCategory !== 'all' && `in ${selectedCategory}`}
          </p>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => openLightbox(image)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10" />
                
                <img
                  data-src={image.src}
                  src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23001219'/%3E%3C/svg%3E`}
                  alt={image.alt}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                    loadedImages.has(image.src) ? 'loaded' : 'loading'
                  }`}
                  onLoad={() => handleImageLoad(image.src)}
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-full group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                  <p className="text-white/80 text-sm capitalize">{image.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {paginatedImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer break-inside-avoid"
                onClick={() => openLightbox(image)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10" />
                
                <img
                  data-src={image.src}
                  src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23001219'/%3E%3C/svg%3E`}
                  alt={image.alt}
                  className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    loadedImages.has(image.src) ? 'loaded' : 'loading'
                  }`}
                  onLoad={() => handleImageLoad(image.src)}
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-full group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                  <p className="text-white/80 text-sm capitalize">{image.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    currentPage === page
                      ? 'bg-[var(--brand-orange)] text-white font-semibold'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center mt-4 text-[#E9D8A6]/60">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredImages.length)} of {filteredImages.length} photos
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-6xl max-h-[90vh] mx-auto" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
            
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">{selectedImage.title}</h2>
              <p className="text-white/60 mb-4 capitalize">{selectedImage.category}</p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => shareImage(selectedImage)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
