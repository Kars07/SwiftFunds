import React from 'react';
import zigzag from "../assets/zigzag.png";
import money from "../assets/money.png";

export const Ready: React.FC = () => {
  const handleLaunchApp = () => {
    window.open("/register", "_blank");
  };

  return (
    <div>
      <h1 className="text-9xl font-bold text-white text-center pt-40 relative">
        <div className="absolute -left-60 pl-8 rotate-[65deg] translate-y-[-180px]">
          <img src={zigzag} alt="Zigzag Illustration" className="w-[800px] h-auto" />
        </div>
        Ready To Take <br />Control of Your Finances ?
        <div className="absolute right-40 pl-8 translate-y-[-110px]">
          <img src={money} alt="Money Illustration" className="w-[170px] h-auto" />
        </div>
      </h1>

      {/* Hidden on small screens */}
      <div className="hidden lg:block">
        <div className="flex justify-center">
          <button
            onClick={handleLaunchApp}
            className="bg-orange-600 cursor-pointer w-[50%] text-4xl my-30 text-white mb-20 font-bold py-7 px-4 rounded-4xl transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-orange-700"
          >
            Start Lending or Borrowing
          </button>
        </div>
      </div>
    </div>
  );
};