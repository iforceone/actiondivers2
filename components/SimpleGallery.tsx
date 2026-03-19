import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../utils/imageOptimization';

const SimpleGallery: React.FC = () => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoads, setImageLoads] = useState<Set<string>>(new Set());

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => new Set([...prev, imageId]));
    console.log(`❌ Image failed to load: ${imageId}`);
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoads(prev => new Set([...prev, imageId]));
    console.log(`✅ Image loaded successfully: ${imageId}`);
  };

  return (
    <div className="min-h-screen bg-[#001219] text-[#E9D8A6] p-8">
      <h1 className="text-4xl font-bold mb-8">Action Divers Belize Gallery</h1>
      <div className="mb-4">
        <p className="text-[#E9D8A6]/60">Found {GALLERY_IMAGES.length} images</p>
        <p className="text-[#E9D8A6]/40 text-sm">Loaded: {imageLoads.size} | Failed: {imageErrors.size}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {GALLERY_IMAGES.map((image) => (
          <div key={image.id} className="border border-white/20 rounded-lg overflow-hidden bg-white/5">
            <div className="relative h-48 bg-[#001219]/50 flex items-center justify-center">
              {imageErrors.has(image.id) ? (
                <div className="text-center p-4">
                  <div className="text-red-400 mb-2">❌ Image Failed</div>
                  <div className="text-xs text-[#E9D8A6]/60">{image.src}</div>
                </div>
              ) : imageLoads.has(image.id) ? (
                <div className="text-green-400 text-center p-2">
                  <div className="text-sm">✅ Loaded</div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="text-yellow-400 mb-2">⏳ Loading...</div>
                  <div className="text-xs text-[#E9D8A6]/60">{image.src}</div>
                </div>
              )}
              <img 
                src={image.src} 
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                onLoad={() => handleImageLoad(image.id)}
                onError={() => handleImageError(image.id)}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{image.title}</h3>
              <p className="text-sm text-[#E9D8A6]/60">{image.category}</p>
              <p className="text-xs text-[#E9D8A6]/40 mt-2">{image.src}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Test direct image access */}
      <div className="mt-8 p-4 border border-white/20 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Direct Image Test</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-2">Test 1: Direct path</p>
            <img src="/images/gallery/action-divers-real-1.jpg" alt="Test 1" className="w-32 h-32 object-cover border" />
          </div>
          <div>
            <p className="text-sm mb-2">Test 2: Public folder</p>
            <img src="./images/gallery/action-divers-real-1.jpg" alt="Test 2" className="w-32 h-32 object-cover border" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGallery;
