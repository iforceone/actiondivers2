import React from 'react';

const GalleryTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#001219] text-[#E9D8A6] p-8">
      <h1 className="text-4xl font-bold mb-8">Gallery Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Basic Test</h2>
        <p>If you can see this text, React is working.</p>
        <img 
          src="/images/gallery/Diver-1-768x432.png" 
          alt="Test Image" 
          className="w-64 h-64 object-cover border-2 border-white"
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Current Time</h2>
        <p>{new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default GalleryTest;
