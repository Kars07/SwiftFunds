import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/contact", formData);
      setSuccessMessage("Thank you for contacting SwiftFund! We'll get back to you soon.");
      setFormData({ fullName: "", email: "", companyName: "", message: "" });
    } catch (error) {
      console.error(error);
      setSuccessMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="text-gray-700 min-h-screen flex w-full flex-row">
      <div className="w-[40%] pt-[5%] flex-col text-center flex justify-center items-center">
        <h1 className="text-7xl italic font-special">Let's Chat</h1>
        <h2 className="px-10 pt-4">
          At Swiftfund, we prioritize timely responses to your needs.
        </h2>
      </div>

      <div className="flex justify-center items-center">
        <hr className="border-4 top-40 absolute rounded-4xl border-orange-600 w-0.5 bg-orange-600 h-[60vh]" />
      </div>

      <div className="w-[40%] flex flex-col mt-40 justify-center ml-40">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="py-2">
            <label htmlFor="fullName" className="pb-1 font-bold">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="py-2">
            <label htmlFor="email" className="pb-1 font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="py-2">
            <label htmlFor="companyName" className="pb-1 font-bold">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="py-2">
            <label htmlFor="message" className="pb-1 font-bold">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="4"
              required
            />
          </div>

          <div className="flex justify-center items-center py-10">
            <button
              type="submit"
              className="inline-block hover:bg-orange-600 border-3 bg-blur hover:text-white w-50 delay-100 duration-150 text-orange-600 text-center rounded-3xl px-6 py-3 font-semibold shadow hover:transition cursor-pointer"
            >
              Submit
            </button>
          </div>

          {successMessage && (
            <div className="text-center text-green-600 font-semibold">
              {successMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;