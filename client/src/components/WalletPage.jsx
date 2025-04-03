import React from "react";
import { useNavigate } from "react-router-dom";

function WalletPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-300 bg-opacity-30 min-h-screen">
      <div className="flex flex-col p-10 max-md:p-6 max-sm:p-4">
        {/* Back button */}
        <div className="mb-6">
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

        {/* Main wallet card */}
        <div className="p-10 bg-white rounded-[50px] max-md:p-6 max-sm:p-4">
          <div className="flex justify-between items-center max-md:flex-col max-md:gap-6">
            <div className="flex gap-6 items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8a489af453f021aee7f0a2b07b1ba54a41bd8b78"
                alt=""
                className="w-[277px] h-[206px]"
              />
              <div className="text-6xl text-black">My wallet</div>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-6xl text-black">Secured by Razor Pay</div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e6d168bd56074f36bb7cbeb98910526a5cad5e78"
                alt=""
                className="w-[270px] h-[241px]"
              />
            </div>
          </div>
          <div className="flex flex-col items-center mt-16 max-md:mt-10">
            <div className="text-5xl text-center text-black">Total Balance</div>
            <div className="mt-4 text-9xl text-black">₹5000.00</div>
          </div>
          <div className="flex gap-10 justify-center mt-16 max-md:flex-col max-md:items-center">
            <button className="text-7xl text-white bg-indigo-500 shadow-sm cursor-pointer h-[152px] rounded-[30px] w-[426px] flex items-center justify-center">
              Deposit
            </button>
            <button className="text-7xl shadow-sm cursor-pointer bg-neutral-400 bg-opacity-40 h-[152px] rounded-[30px] text-black text-opacity-70 w-[418px] flex items-center justify-center">
              Withdraw
            </button>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="flex gap-10 mt-10 max-md:flex-col">
          {/* Withdraw Money section */}
          <div className="flex-1 p-10 bg-white rounded-[60px] max-md:p-6 max-sm:p-4">
            <div className="mb-10 text-6xl text-neutral-500">
              Withdraw Money
            </div>
            <div className="p-10 bg-white border-gray-200 border-[5px] max-md:p-6 max-sm:p-4">
              <div className="mb-10 text-4xl font-bold text-gray-600">
                Enter Amount
              </div>
              <div className="flex items-center p-6 mb-10 rounded-2xl border border-[6px]">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/bf8392c1691ed2a4e6dbfb6f98ceb40cac165b6e"
                  alt=""
                  className="w-[21px] h-[22px] mr-[12px]"
                />
                <div className="text-xl font-bold text-gray-400">0.00</div>
              </div>
              <div className="mb-4 text-lg text-gray-600">Payment Method</div>
              <div className="flex gap-6 max-sm:flex-col">
                <div className="flex flex-col flex-1 gap-3 items-center p-6 bg-indigo-50 rounded-2xl">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/297395ecf6b233ede0420607ca3e5682b25e2f24"
                    alt=""
                    className="w-[38px] h-[40px]"
                  />
                  <div className="text-xl font-bold text-gray-600">UPI</div>
                </div>
                <div className="flex flex-col flex-1 gap-2 items-center p-6 bg-gray-50 rounded-xl">
                  <div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          '<svg id="118:53" layer-name="Credit card 1" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-[36px] h-[36px]"> <path d="M30 6L6 6C4.335 6 3.015 7.335 3.015 9L3 27C3 28.665 4.335 30 6 30L30 30C31.665 30 33 28.665 33 27V9C33 7.335 31.665 6 30 6ZM30 27L6 27L6 18L30 18V27ZM30 12L6 12L6 9L30 9V12Z" fill="#5E6672"></path> </svg>',
                      }}
                    />
                  </div>
                  <div className="text-xl font-bold text-gray-600">Card</div>
                </div>
                <div className="flex flex-col flex-1 gap-3 items-center p-6 bg-gray-50 rounded-xl">
                  <div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          '<svg id="118:61" layer-name="Prohibit 1" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-[36px] h-[36px]"> <path d="M18.0004 3.43994C9.95916 3.43994 3.44043 9.95868 3.44043 17.9999C3.44043 26.0412 9.95916 32.5599 18.0004 32.5599C26.0417 32.5599 32.5604 26.0412 32.5604 17.9999C32.5519 9.96219 26.0382 3.44843 18.0004 3.43994ZM30.3204 17.9999C30.3233 20.8805 29.3117 23.67 27.463 25.8791L10.1212 8.53594C13.7938 5.48067 18.9015 4.82394 23.2275 6.8508C27.5534 8.87766 30.3177 13.2227 30.3204 17.9999ZM5.68043 17.9999C5.67756 15.1194 6.6892 12.3298 8.53783 10.1207L25.8796 27.4639C22.2071 30.5192 17.0994 31.1759 12.7734 29.1491C8.44742 27.1222 5.68316 22.7772 5.68043 17.9999Z" fill="#5E6672"></path> </svg>',
                      }}
                    />
                  </div>
                  <div className="text-lg text-gray-600">Net Banking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History section */}
          <div className="flex-1 p-10 bg-white rounded-[60px] max-md:p-6 max-sm:p-4">
            <div className="mb-10 text-6xl text-neutral-500">
              Transaction History
            </div>
            <div className="flex flex-col border border-zinc-200 rounded-[50px]">
              <div className="flex items-center p-6 border border-zinc-200">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/422e769f491d2b8ebf84f4a407f09a9b1220e748"
                  alt=""
                  className="w-[35px] h-[38px] mr-[24px]"
                />
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-700">1000.00</div>
                  <div className="text-xl font-bold text-gray-500">
                    2024-03-10 14:30
                  </div>
                </div>
                <div className="px-4 py-2 text-xl text-green-600 bg-green-50 rounded-3xl">
                  Success
                </div>
              </div>
              <div className="flex items-center p-6 border border-zinc-200">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/3dbc29409efaadd65ac72305db0bef1ab68870d1"
                  alt=""
                  className="w-[40px] h-[38px] mr-[24px]"
                />
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-700">500.00</div>
                  <div className="text-xl font-bold text-gray-500">
                    2024-03-09 16:45
                  </div>
                </div>
                <div className="px-6 py-2 text-lg text-amber-700 bg-amber-50 rounded-3xl">
                  Pending
                </div>
              </div>
              <div className="flex items-center p-6">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/15d8824c5db6017d692dbfde9bc8d7a12bc629d9"
                  alt=""
                  className="w-[36px] h-[37px] mr-[24px]"
                />
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-700">2500.00</div>
                  <div className="text-xl font-bold text-gray-500">
                    2024-03-08 09:15
                  </div>
                </div>
                <div className="px-4 py-2 text-xl text-green-600 bg-green-50 rounded-3xl">
                  Success
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
