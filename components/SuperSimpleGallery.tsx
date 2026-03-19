import React from 'react';

const SuperSimpleGallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#001219] text-[#E9D8A6] p-8">
      <h1 className="text-4xl font-bold mb-8">Super Simple Gallery Test</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Real Action Divers Image Test</h2>
        <img 
          src="/images/gallery/Diver-1-768x432.png" 
          alt="Action Divers Diver" 
          className="w-64 h-64 object-cover border-2 border-white"
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Second Real Image Test</h2>
        <img 
          src="/images/gallery/BBQ-Food-225x300.jpg" 
          alt="Action Divers BBQ" 
          className="w-64 h-64 object-cover border-2 border-white"
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Debug Info</h2>
        <p>Image 1 path: /images/gallery/Diver-1-768x432.png</p>
        <p>Image 2 path: /images/gallery/BBQ-Food-225x300.jpg</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Fallback Test</h2>
        <img 
          src="https://via.placeholder.com/300x200/001219/E9D8A6.png?text=If+You+See+This+Images+Work" 
          alt="Placeholder test" 
          className="w-64 h-64 object-cover border-2 border-white"
        />
      </div>
    </div>
  );
};

export default SuperSimpleGallery;
