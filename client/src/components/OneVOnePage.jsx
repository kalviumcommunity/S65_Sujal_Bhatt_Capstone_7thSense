import React from "react";

function OneVOnePage() {
  return (
    <div className="flex overflow-hidden flex-col items-center px-20 pt-5 max-md:px-5">
      <div className="w-full max-w-[1462px] max-md:max-w-full">
        <div className="flex flex-wrap ml-3 w-full max-w-[1250px] max-md:max-w-full">
          <div className="flex relative flex-col grow shrink-0 items-start px-20 pt-6 basis-0 min-h-[1067px] pb-[874px] rounded-[40px] shadow-[20px_20px_0px_rgba(65,52,185,1)] w-fit max-md:px-5 max-md:pb-24 max-md:max-w-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/b7a2a681bbb0665c29ff08816c05c4a1e38e07b1?placeholderIfAbsent=true"
              className="object-cover absolute inset-0 size-full"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/0efdafcedc0392f17b4df8595ad19725635ca1c7?placeholderIfAbsent=true"
              className="object-contain max-w-full aspect-[1.13] w-[191px]"
            />
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/e5d60edece3ad32ce472039b7f498642fe3e606c?placeholderIfAbsent=true"
            className="object-contain shrink-0 self-start mt-10 max-w-full aspect-[0.85] w-[143px]"
          />
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/0e3606bc6cb1427fac411e73b7dded2e/356808c7f1941c8b887d048490aad6ebc64c963f?placeholderIfAbsent=true"
          className="object-contain mt-8 w-full aspect-[2.16] rounded-[40px] shadow-[20px_20px_0px_rgba(65,52,185,1)] max-md:max-w-full"
        />
      </div>
    </div>
  );
}

export default OneVOnePage;