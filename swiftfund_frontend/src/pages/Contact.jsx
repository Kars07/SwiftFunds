import React from "react";

const Contact = () => {
  return (
    <div className="text-gray-700 h-[100vh] flex w-full flex-row">
      <div className="w-[40%]  pt-[5%] flex-col text-center flex justify-center items-center ">
         <h1 className="text-7xl italic font-special"> Let's Chat</h1>
         <h2 className="px-10 pt-4">At Swiftfund, we prioritize timely responses to your needs.</h2>
      </div>
      <div className="flex justify-center items-center  ">
        <hr className="border-4  top-40 absolute rounded-4xl border-orange-600 w-0.5  bg-orange-600 h-[60vh]" />
      </div>
      <div className=" w-[40%] flex flex-col mt-40 justify-center ml-40 ">
        <div className="py-2">
          <label htmlFor="" className="pb-1 font-bold">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-2 border-3  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div className="py-2">
          <label htmlFor="Email" className="pb-1 font-bold">Email</label> 
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div className="py-2">
          <label htmlFor="" className="pb-1 font-bold">Company Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
       </div>
       <div className="py-2"></div>
          <label htmlFor="" className="pb-1 font-bold">Message</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <div className="flex justify-center items-center py-10">
           <a href="#" class="inline-block hover:bg-orange-600 border-3 bg-blur hover:text-white w-50 delay-100 duration-150 text-orange-600 text-center rounded-3xl  px-6 py-3 font-semibold shadow hover:transition">Submit</a>
          </div>
       </div>
      
    </div>
  );
};

export default Contact;
