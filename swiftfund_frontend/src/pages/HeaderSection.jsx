import React from "react";
import { HowItWorks } from "../components/HowItWorks";
import { WhyChoose } from "../components/WhyChoose";
import FAQ from "../components/FAQ"
import { Ready } from "../components/Ready";
import Footer from "../components/Footer";
import KeyFeatures from "../components/KeyFeatures";



const HeaderSection = () => {
  const handleLearnMore = () => {
    // Open the registration page in a new tab
    window.open("/register", "_blank");
  };




  return (
    <div className=" justify-center">
        <div className="">
          <video
          className="absolute top-0 right-0 w-full h-full  object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="/videos/market-women.mp4"
            type="video/mp4"
            style={{ zIndex: -1 }}
          ></video>
          <div className="absolute inset-0 bg-black opacity-50"></div>

          {/* Hero Section */}
          <div className=" text-white text-center justify-center min-h-screen flex flex-col align-middle py-20 transform translate-y-10 ">
            <h1 className="md:text-5xl text-4xl font-extrabold mb-6 z-10 ">
              Borrow and Lend with Ease
            </h1>
            <h2 className="z-10">
            Whether you’re a student, small‑business owner, or retiree, SwiftFund
            lets you borrow or lend in minutes. <br></br> With clear,
              simple terms and the security of Cardano’s smart contracts,
            you get quick approvals <br></br>and total peace of mind, backed by real community recommendations
            </h2>
            <div className="flex justify-center">
              <button
                onClick={handleLearnMore}
                className="
                relative overflow-hidden rounded-4xl cursor-pointer
                transform transition-all duration-300 ease-in-out
                hover:-translate-y-1 hover:scale-110
                bg-[length:200%_100%] bg-no-repeat
                bg-[linear-gradient(to_right,_#ea580c_50%,#c2410c_50%)]
                bg-right  
                hover:bg-left 
                text-white font-bold py-4 px-7 m-7
              "
            >
                Get Started
              </button>
            </div>
          </div>
          <section class="bg-white py-16 flex justify-start items-start w-[70%] text-start">
            <div class="px-5 mx-auto">
              <h2 class="text-3xl font-bold mb-4 text-gray-900">Explore Decentralized Lending with SWIFT FUND</h2>
              <p class="text-lg text-gray-700 mb-6">Start with SWIFTFund to take control of your financial future through secure, transparent, peer-to-peer lending. Experience trustless finance with blockchain at its core.</p>
              <a href="#" class="inline-block hover:bg-orange-600 border-3 hover:text-white  delay-100 duration-150 text-orange-600 rounded-3xl  px-6 py-3 font-semibold shadow hover:transition">Discover More</a>
            </div>
          </section>
          <div>
            <HowItWorks/>
            <KeyFeatures/>
           
          </div>
          <div className=" w-full h-full relative top-0 object-cover bg-gray-900">
             <h1 className="text-9xl pt-0 pl-10 transform translate-y-30 font-bold sticky text-white ">FAQ</h1>
            <FAQ/>
          </div>
          <div className=" bg-gray-900">
             <WhyChoose/>
          </div>
        </div>
        <div className=" bg-gray-900">
           <Ready/>
           
        </div>
       
    </div>
  );
};

export default HeaderSection;