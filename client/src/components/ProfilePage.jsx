import React from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="flex overflow-hidden flex-col pt-10 pr-16 pl-8 bg-gray-300 bg-opacity-30 max-md:px-5">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-indigo-700 text-white rounded-full w-12 h-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div className="max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-[17%] max-md:ml-0 max-md:w-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/96b77d6107957a721b20ae3289a7a2a88c05d691?placeholderIfAbsent=true"
              className="object-contain shrink-0 max-w-full aspect-[1.35] w-[279px]"
            />
          </div>
          <div className="ml-5 w-[66%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow mt-20 max-md:mt-10 max-md:max-w-full">
              <div className="z-10 self-center pb-6 max-w-full rounded-full w-[252px]">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/4d21a9e7d9a2e9f52a811e03e0c34ebd3680033d?placeholderIfAbsent=true"
                  className="object-contain z-10 mt-0 mr-0 w-full aspect-[1.3]"
                />
              </div>
              <div className="flex flex-col items-center px-16 pt-12 w-full text-7xl bg-white border border-solid shadow-2xl border-black border-opacity-0 rounded-[50px] max-md:px-5 max-md:max-w-full max-md:text-4xl">
                <div className="ml-5 font-bold text-indigo-500 font-baloo max-md:text-4xl">
                  Sujal Bhatt
                </div>
                <div className="flex gap-10 items-start self-start mt-9 max-w-full text-5xl text-black w-[863px] max-md:flex-col max-md:text-4xl">
                  <div className="grow max-md:text-4xl">Matches Played</div>
                  <div className="grow shrink w-[252px] max-md:text-4xl">
                    Matches Won
                  </div>
                  <div className="self-stretch max-md:text-4xl">
                    Tier
                    <br />
                  </div>
                </div>
                <div className="z-10 mt-44 mb-0 ml-11 text-indigo-700 max-md:mt-10 max-md:mb-2.5 max-md:text-4xl">
                  ₹500.00
                  <br />
                </div>
              </div>
            </div>
          </div>
          <div className="ml-5 w-[17%] max-md:ml-0 max-md:w-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/fb2e1030c7cbba42a34e5b6f9f5d513f390c2fc6?placeholderIfAbsent=true"
              className="object-contain shrink-0 mt-6 max-w-full aspect-[1.48] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[270px]"
            />
          </div>
        </div>
      </div>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/2c6cbb12996c400b78f6d4f27fb82131434ee96d?placeholderIfAbsent=true"
        className="object-contain self-center mt-24 ml-7 w-full aspect-[1.58] max-w-[1246px] max-md:mt-10 max-md:max-w-full"
      />
    </div>
  );
}

export default ProfilePage;
