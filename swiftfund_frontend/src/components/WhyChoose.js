import React, { useState } from 'react';
import secure from '../assets/secure.png';
import fast from '../assets/fast.png';
import middleman from '../assets/middleman.png';

const FlipCard = ({ title, image }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="pt-20 w-[270px] h-[480px] m-4 perspective cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)} // Mobile tap
    >
      <div
        className={`w-full h-full relative preserve-3d transition-transform duration-500 rounded-xl ${
          isFlipped ? 'rotate-y-180' : ''
        } hover:rotate-y-180`}
      >
        {/* Front Face */}
        <div className="absolute w-full h-full backface-hidden bg-cover rounded-xl shadow-lg z-10" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>

          <div className="flex justify-center  items-center h-full">
            <img src={image} alt="card visual" className="w-78 h-78 object-contain" />
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute w-full pt-10 h-full backface-hidden rotate-y-180 bg-cover rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div>
            <h1 className="text-3xl text-center text-orange-600 font-bold p-10 leading-relaxed">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WhyChoose = () => {
  return (
    <div className="align-middle">
      <div className="pt-20 font-special text-4xl text-white text-center font-bold">
        <h1 className="pb-3 text-4xl">WHY CHOOSE SWIFTFUND</h1>
        <div className="justify-center flex">
          <div className="border border-white w-50 rounded-2xl h-3 bg-white items-center"></div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        {/* First two cards */}
        <div className="flex flex-wrap justify-center space-x-2">
          <FlipCard title='"Built on Cardano ensuring end-to-end security"' image={secure} />
          <FlipCard title='"Quick application and approval process"' image={fast} />
        </div>

        {/* One card at bottom */}
        <div className="flex justify-center">
          <FlipCard title='"Connects directly with lenders or borrowers, no middleman"' image={middleman} />
        </div>
      </div>
    </div>
  );
};