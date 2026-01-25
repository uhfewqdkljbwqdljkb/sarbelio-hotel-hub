import React from 'react';
import saintCharbelStatue from '@/assets/gallery/saint-charbel-statue.jpeg';
import livingRoom from '@/assets/gallery/living-room.jpeg';
import snowChapel from '@/assets/gallery/snow-chapel.jpeg';
import balconyView from '@/assets/gallery/balcony-view.jpeg';
import cozySofa from '@/assets/gallery/cozy-sofa.jpeg';
import diningArea from '@/assets/gallery/dining-area.jpeg';

const galleryImages = [
  {
    src: balconyView,
    alt: 'Snowy balcony with mountain view',
    span: 'col-span-2 row-span-2',
  },
  {
    src: livingRoom,
    alt: 'Comfortable living room',
    span: 'col-span-1 row-span-1',
  },
  {
    src: cozySofa,
    alt: 'Cozy sofa with decorative pillows',
    span: 'col-span-1 row-span-1',
  },
  {
    src: diningArea,
    alt: 'Elegant dining area',
    span: 'col-span-1 row-span-1',
  },
  {
    src: saintCharbelStatue,
    alt: 'Saint Charbel statue at night',
    span: 'col-span-1 row-span-1',
  },
  {
    src: snowChapel,
    alt: 'Snow-covered chapel on the mountain',
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
            Take a visual journey through Sarbelio Chalet Suites and discover the beauty 
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
