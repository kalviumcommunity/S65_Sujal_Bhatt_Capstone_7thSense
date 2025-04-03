import React from "react";

function LandingPage() {
  return (
    <div className="relative w-full h-screen bg-gray-300 bg-opacity-30 overflow-hidden">
      <div className="flex justify-between items-center px-12 py-3 max-sm:flex-col max-sm:gap-2">
        <div className="flex relative max-sm:justify-center">
          <div className="flex items-center text-4xl font-extrabold text-indigo-700 max-md:text-3xl pl-16 sm:pl-20">
            <span className="mr-2">7</span>
            <span>Sense</span>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/3ec3386b023b29815faeffa182c60e035ae2ae5c"
            className="absolute h-[80px] left-0 top-[-12px] w-[80px]"
            alt="Rocket logo"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/dafada1cc0283d92ea4e49ae4cc0b211a7ba97f1"
            className="absolute h-[140px] left-[-12px] top-[80px] w-[140px]"
            alt="Game controller"
          />
        </div>
        <div className="flex gap-5 items-center max-md:gap-4 max-sm:justify-center max-sm:w-full">
          <div className="text-2xl text-gray-500 max-md:text-xl cursor-pointer hover:text-gray-600 transition-colors">
            Sign in
          </div>
          <div className="px-4 py-1.5 text-2xl text-indigo-700 rounded-3xl border-indigo-800 border-solid border-[3px] max-md:text-xl cursor-pointer hover:bg-indigo-50 transition-colors">
            Get started
          </div>
        </div>
      </div>
      <div className="px-8 py-0">
        <div className="mt-0 text-center">
          <div className="text-indigo-800 flex flex-col gap-1 max-md:scale-[0.8] max-sm:scale-[0.6] -mt-8">
            <div className="text-6xl font-londrina leading-none">
              7 Seconds ...
            </div>
            <div className="text-7xl font-londrina leading-none">
              1 Winner !!
            </div>
            <div className="text-6xl font-londrina leading-none">
              Are You Fast Enough ?
            </div>
          </div>
        </div>
        <div className="flex justify-around px-16 py-0 mt-2 max-md:flex-wrap max-md:gap-3 max-sm:flex-col max-sm:items-center">
          <div className="text-2xl text-center text-gray-500 max-md:w-[45%] max-sm:w-full max-md:text-xl max-sm:text-lg">
            Easy Rules
          </div>
          <div className="text-2xl text-center text-gray-500 max-md:w-[45%] max-sm:w-full max-md:text-xl max-sm:text-lg">
            Multiple modes
          </div>
          <div className="text-2xl text-center text-gray-500 max-md:w-[45%] max-sm:w-full max-md:text-xl max-sm:text-lg">
            Unlimited matches
          </div>
          <div className="text-2xl text-center text-gray-500 max-md:w-[45%] max-sm:w-full max-md:text-xl max-sm:text-lg">
            Earnings
          </div>
        </div>
        <div className="relative -mt-4 h-[80vh] max-sm:hidden flex justify-center items-start">
          <div className="relative w-full h-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4284ee859b9acb337644c0f5e1221a295aa3aeb3"
              className="absolute left-[55%] -translate-x-2/4 h-[75vh] w-auto max-md:h-[70vh] top-[-40px]"
              alt="Game visual 1"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/fd4be1e75182e7ff1666c1b64e73f53cfebe4ecd"
              className="absolute left-[12%] h-[80vh] w-auto max-md:h-[75vh] top-[-80px]"
              alt="Game visual 2"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f051b7458942bf313a61402b43f86d415163bd98"
              className="absolute right-[12%] h-[75vh] w-auto max-md:h-[70vh] top-[-40px]"
              alt="Game visual 3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
