import { useState, useEffect } from "react";
import logo from "../assets/logo.png"

export default function StampNetDocs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if (isMobile) setMenuOpen(false);
  };

  return (
    <div className="flex flex-col font-sans">
       {isMobile && !menuOpen && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 text-gray-900 text-2xl border-2 border-gray-900 bg-opacity-20 backdrop-blur-md px-2 py-1"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 backdrop-blur-lg  bg-gray-800 text-white p-5 overflow-y-auto transform transition-transform duration-300 z-40 ${
          menuOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "bg-opacity-70 backdrop-blur-md w-2/3 "  : ""}`}
      >
        {isMobile && (
          <button onClick={toggleMenu} className="absolute top-7 right-2 text-xl">
            ✖
          </button>
        )}
        <div className="mb-6 flex gap-3">
          <a href="/">
            <img src={logo} alt="Logo" className="w-10" />
          </a>
          <div className="flex justify-center items-center">
          <span className="text-white font-bold text-2xl">SWIFTFUND</span>
          </div>
        </div>
        <ul className="space-y-6 py-10 px-4">
          {[
            { id: "introduction", label: "Introduction" },
            { id: "authentication", label: "User Authentication" },
            { id: "getting-started", label: "Getting Started" },
            { id: "features", label: "Features" },
            { id: "api-reference", label: "API Reference" },
            { id: "faqs", label: "FAQs" },
            { id: "contact", label: "Contact & Support" }
          ].map(({ id, label }) => (
            <li key={id} onClick={() => scrollToSection(id)} className="cursor-pointer hover:text-orange-600">
              {label}
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <div className={`p-5 max-w-4xl ${isMobile ? "mt-20" : "ml-96"}`}>
        <h1 className="text-center text-3xl font-bold text-orange-600 py-6">
          SwiftFund Documentation
        </h1>
        <p className="text-center mb-6">
        Welcome to the SwiftFund documentation page. Here you'll find all the necessary information about how to use our decentralized microloans platform, built on cardano blockchain technology to ensure trust and security for lenders and borrowers.


        </p>

        <Section id="introduction" title="Introduction">
        SwiftFund is a decentralized microloans platform built on blockchain technology. It connects borrowers in need of small loans with lenders willing to provide capital, all while ensuring trust, security, and transparency. By utilizing blockchain, we eliminate intermediaries and give users full control over their loans and repayments.
         </Section>

        <Section id="authentication" title="User Authentication">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Authentication:</strong> A quick and easy way to sign in.</li>
            <li><strong>MetaMask:</strong> A decentralized wallet necessary for storing and managing uploaded files.</li>
          </ul>
        </Section>

        <Section id="getting-started" title="Getting Started">
          <ol className="list-decimal pl-6 space-y-2">
            <li>Create an account by signing up on SwiftFund or connect your wallet.</li>
            <li>Borrowers can apply for a loan by filling in the necessary details, including loan amount and repayment terms.</li>
            <li>Lenders can browse open loan requests and choose to fund the loan.</li>
            <li>Once the loan is funded, borrowers are notified, and funds are released to their wallets.</li>
            <li>Repayment can be made on time, and both parties will receive transaction updates on the platform.</li>
          </ol>
        </Section>

        <Section id="features" title="Features">
          <ul className="list-disc pl-6 space-y-2">
            <li>Peer-to-Peer Lending: Borrowers and lenders interact directly, without intermediaries.</li>
            <li>Decentralized Credit Scoring: Blockchain-based credit scoring systems determine borrower trustworthiness.</li>
            <li>Blockchain Security: All transactions are secured and transparent on the blockchain.            </li>
            <li>Flexible Loan Terms: Borrowers can define repayment schedules that suit their needs.            </li>
            <li>Automated Loan Repayments: Automated reminders and smart contract enforcement ensure on-time repayments.</li>
          </ul>
        </Section>

        <Section id="api-reference" title="API Reference">
          <img src="/images/carbon.jpeg" alt="API Example" className="w-full h-52 object-cover" />
        </Section>

        <Section id="faqs" title="FAQs">
          <div className="space-y-4">
            <div>
              <p><strong>What is SwiftFund?</strong></p>
              <p>SwiftFund is a decentralized platform for microloans, where borrowers can apply for loans, and lenders can choose to fund these loans directly on the blockchain.</p>
            </div>
            <div>
              <p><strong>How does the loan application process work?</strong></p>
              <p>Borrowers can fill out an application on the SwiftFund platform, specifying the loan amount, repayment terms, and the purpose of the loan. Lenders can then choose to fund these requests.</p>
            </div>
            <div>
              <p><strong>How is the loan secured?</strong></p>
              <p>Loans are secured through smart contracts and the platform’s decentralized reputation and credit scoring system. All transactions are transparently recorded on the blockchain.</p>
            </div>
          </div>
        </Section>

        <Section id="contact" title="Contact & Support">
          For assistance, please reach out via our handle:
          <div className="flex space-x-4 text-2xl mt-4">
            <a href="https://x.com/SwiftFund_
" target="_blank" rel="noopener noreferrer"><i className='bx bxl-twitter'></i></a>
            <a href=" https://github.com/Kars07/SwiftFunds " target="_blank" rel="noopener noreferrer"><i className='bx bxl-github'></i></a>
            <a href="https://www.youtube.com/watch?v=sScVIg0nfC4&t=9s" target="_blank" rel="noopener noreferrer"><i className='bx bxl-youtube'></i></a>
            <i className='bx bxl-linkedin'></i>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="pt-16 pb-8">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">
        {title}
      </h2>
      <div className="text-base mb-6 text-gray-700">
        {children}
      </div>
      <hr className="my-6 border-gray-900" />
    </section>
  );
}