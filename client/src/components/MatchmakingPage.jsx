import React from "react";

function MatchmakingPage() {
  return (
    <div className="flex overflow-hidden flex-col items-center px-20 pt-28 text-9xl text-black whitespace-nowrap bg-gray-300 bg-opacity-30 max-md:px-5 max-md:pt-24 max-md:text-4xl">
      <div className="flex flex-col w-full max-w-[1422px] max-md:max-w-full max-md:text-4xl">
        <div className="flex flex-wrap gap-5 justify-between self-end mr-12 w-full max-w-[1266px] max-md:mr-2.5 max-md:max-w-full max-md:text-4xl">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c157dec9506bf46792f45d75f47226e26ecb5194?placeholderIfAbsent=true"
            className="object-contain shrink-0 max-w-full aspect-[0.98] w-[253px]"
            alt="Player 1"
          />
          <div className="my-auto max-md:text-4xl">VS</div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/06ad8e8afccd8f81c4933aac9ff4e6f3c2af4f7b?placeholderIfAbsent=true"
            className="object-contain shrink-0 self-end mt-5 max-w-full aspect-[0.85] w-[205px]"
            alt="Player 2"
          />
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/b7a4815e3f72035f77480e29e9c90883e9f746ca?placeholderIfAbsent=true"
          className="object-contain mt-24 w-full aspect-[1.07] max-md:mt-10 max-md:max-w-full"
          alt="Game area"
        />
      </div>
    </div>
  );
}

export default MatchmakingPage;
