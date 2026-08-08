import React from "react";

function Info() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-12 lg:px-24 bg-white/40 backdrop-blur-sm">
      <div className="max-w-lg">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome to Career OS</h1>
          <p className="text-zinc-500 text-lg">Your ultimate platform for career growth and seamless management.</p>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          
          {/* Info Block 1 */}
          <div className="p-5 rounded-2xl bg-zinc-100/80 border border-zinc-200/50 hover:bg-white hover:border-black/10 transition-all duration-300">
            <h3 className="text-sm font-bold text-black mb-2 uppercase tracking-wider">Our Mission</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              We are dedicated to providing a seamless, fast, and minimalist experience. Design should get out of the user's way and let you focus on what matters most.
            </p>
          </div>

          {/* Info Block 2 */}
          <div className="p-5 rounded-2xl bg-zinc-100/80 border border-zinc-200/50 hover:bg-white hover:border-black/10 transition-all duration-300">
            <h3 className="text-sm font-bold text-black mb-3 uppercase tracking-wider">Key Features</h3>
            <ul className="text-sm text-zinc-600 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3"></span>
                Secure end-to-end encryption
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3"></span>
                Blazing fast performance
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3"></span>
                Minimalist Black & White UI
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Info;