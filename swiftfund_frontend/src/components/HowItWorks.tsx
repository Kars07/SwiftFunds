import React from 'react';
import '../gradient-text/gradient-text.css';
import '../index.css';

export const HowItWorks: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen pb-10 overflow-hidden px-4">
      <div className="pt-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 font-special">
          HOW SWIFTFUND WORKS
          <div className="justify-center pt-3 flex">
            <div className="border border-gray-900 w-50 rounded-2xl h-3 bg-gray-900 items-center"></div>
          </div>
        </h1>
      </div>

      <div className="flex flex-wrap cursor-pointer justify-center items-stretch gap-8 mt-12">
        {/* Step 1: Apply */}
        <div className="w-full max-w-[320px] min-h-[400px] bg-white rounded-xl shadow-lg flex flex-col justify-center text-center p-4">
          <div className="hover:scale-110 hover:transform transition-transform duration-300">
            <img
              src="/apply.png"
              alt="Apply"
              className="w-full max-w-[250px] mx-auto mb-4"
              style={{
                filter: 'sepia(1) hue-rotate(-20deg) saturate(4) brightness(1.1)',
              }}
            />
            <div className="transform -translate-y-10">
              <h2 className="text-2xl text-orange-600 font-bold mb-2">Apply</h2>
              <p className="text-lg text-gray-600">Sign up and submit your loan request</p>
            </div>
          </div>
        </div>

        {/* Step 2: Match */}
        <div className="w-full max-w-[320px] min-h-[400px] bg-white rounded-xl shadow-lg flex flex-col justify-center text-center p-4">
          <div className="hover:scale-110 hover:transform transition-transform duration-300">
            <img
              src="/match.png"
              alt="Match"
              className="w-full max-w-[250px] mx-auto mb-4"
              style={{
                filter: 'sepia(1) hue-rotate(-20deg) saturate(4) brightness(1.1)',
              }}
            />
            <div>
              <h2 className="text-2xl text-orange-600 font-bold mb-2">Match</h2>
              <p className="text-lg text-gray-600">We connect you with potential lenders on our platform</p>
            </div>
          </div>
        </div>

        {/* Step 3: Fund */}
        <div className="w-full max-w-[320px] min-h-[400px] bg-white rounded-xl shadow-lg flex flex-col justify-center text-center p-4">
          <div className="hover:scale-110 hover:transform transition-transform duration-300">
            <img
              src="/money.png"
              alt="Fund"
              className="w-full max-w-[250px] mx-auto mb-4"
              style={{
                filter: 'sepia(1) hue-rotate(-20deg) saturate(4) brightness(1.1)',
              }}
            />
            <div>
              <h2 className="text-2xl text-orange-600 font-bold mb-2">Fund</h2>
              <p className="text-lg text-gray-600">Receive your fund directly once matched and approved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};