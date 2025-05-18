import React from 'react';
import zigzag from "../assets/zigzag.png";
import money from "../assets/money.png";

export const Ready: React.FC = () => {
  const handleLaunchApp = () => {
    window.open("/register", "_blank");
  };

  return (
    <div>
      
      <h1 className="md:text-9xl text-7xl font-bold text-black text-center md:pt-40 relative">
        <div className="absolute -left-80  md:-left-80 pl-8 rotate-[65deg] translate-y-[-180px]">
          <img src={zigzag} alt="Zigzag Illustration" className="w-[800px] h-auto lg:block hidden" />
        </div>
        <h1 className='px-3'>
         Ready To Take <br />Control of Your Finances ?
         </h1>
        <div className="absolute md-block -z-10 right-25 pl-8 translate-y-[-110px]">
          <img src={money} alt="Money Illustration" className="w-[170px] h-auto lg:block hidden" />
        </div>
      </h1>

      {/* Hidden on small screens */}
      <div className="">
        <div className="flex justify-center">
          <button
            onClick={handleLaunchApp}
            className="bg-orange-600 cursor-pointer md:w-[50%] w-[70%] lg:text-2xl text-2xl md:text-4xl my-30 text-white md:mb-50 mt-20 font-bold py-6  px-8 lg:px-6 rounded-full lg:rounded-4xl transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-orange-700"
          >
            Start Lending or Borrowing
          </button>
        </div>
      </div>
    </div>
  );
};