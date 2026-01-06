import React from 'react';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
    alt: 'Hotel pool area',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop',
    alt: 'Hotel exterior',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop',
    alt: 'Restaurant dining',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop',
    alt: 'Beach view',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
    alt: 'Luxury suite',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop',
    alt: 'Spa treatment',
    span: 'col-span-2 row-span-1',
  },
];

export const GallerySection: React.FC = () => {
  return (
    <section id="gallery" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#8c7a6b] uppercase tracking-[0.3em] mb-4 block">
            Photo Gallery
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explore Our Resort
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Take a visual journey through Sarbelio Hotel and discover the beauty 
            that awaits you.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image, index) => (
            <div 
              key={index}
              className={`${image.span} relative overflow-hidden rounded-2xl group cursor-pointer`}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-500 flex items-center justify-center">
                <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  {image.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
