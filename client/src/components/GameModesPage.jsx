import React from "react";
import { useNavigate } from "react-router-dom";

function GameModesPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gray-300 bg-opacity-30 flex flex-col p-4 overflow-hidden">
      {/* Header section with profile, navigation, and wallet */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/de8caa2b00ca7b45c7ef3109f7c4ff51c17850ed"
            className="h-[18vh] rounded-[40px] w-auto max-sm:h-[15vh] max-sm:w-auto"
            alt="Profile"
          />
        </div>
        <div className="flex gap-6 max-md:hidden">
          <div className="text-4xl text-black text-opacity-60">
            Buy Lifelines
          </div>
          <div className="text-4xl text-black text-opacity-60">Add Friends</div>
          <div className="text-4xl text-black text-opacity-60">
            View Matches
          </div>
          <div className="text-4xl text-black text-opacity-60">
            Friends List
          </div>
        </div>
        <div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0f9e5eb5af78a41c046a2c4f3b72b9fe7d4a8dce"
            className="h-[20vh] w-auto max-sm:h-[15vh] max-sm:w-auto"
            alt="Wallet"
          />
        </div>
      </div>

      {/* Game modes section */}
      <div className="flex flex-col gap-5 flex-grow justify-center">
        {/* 1V1 Mode */}
        <div
          className="flex relative justify-center items-center mx-auto h-[18vh] bg-indigo-700 shadow-lg rounded-[60px] w-[80%] cursor-pointer"
          onClick={() => navigate("/1v1")}
        >
          <div className="text-7xl text-white z-[1] font-londrina max-md:text-6xl max-sm:text-4xl">
            1 V 1
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/ef1cb759207d85b9a3c54a5c309beecea7de11fd"
            className="absolute z-0 h-[130%] right-[-10%] rotate-[25deg] w-auto max-md:right-[-5%] max-sm:right-[-2%]"
            alt="1v1 mode"
          />
        </div>

        {/* Battle Royale Mode */}
        <div className="flex relative justify-center items-center mx-auto h-[18vh] bg-white shadow-lg rounded-[60px] w-[80%] cursor-pointer">
          <div className="text-7xl text-indigo-700 z-[1] font-londrina max-md:text-6xl max-sm:text-4xl">
            Battle Royale
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0a0091297901cf072b229ec4c033a07080bd3795"
            className="absolute z-0 h-[130%] right-[-10%] rotate-[25deg] w-auto max-md:right-[-5%] max-sm:right-[-2%]"
            alt="Battle Royale mode"
          />
        </div>

        {/* Free Mode */}
        <div className="flex relative justify-center items-center mx-auto h-[18vh] bg-indigo-700 shadow-lg rounded-[60px] w-[80%] cursor-pointer">
          <div className="text-7xl text-white z-[1] font-londrina max-md:text-6xl max-sm:text-4xl">
            Free Mode
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/51412669a4e8fac466be28c94a9052aa14b84985"
            className="absolute z-0 h-[130%] right-[-10%] rotate-[25deg] w-auto max-md:right-[-5%] max-sm:right-[-2%]"
            alt="Free mode"
          />
        </div>
      </div>
    </div>
  );
}

export default GameModesPage;
