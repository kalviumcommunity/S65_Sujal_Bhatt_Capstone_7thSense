import Lottie from "lottie-react";

const LottiePlayer = ({ animationData, width = 300, height = 300, loop = true, lottieRef }) => {
  return (
    <div style={{ width, height, }}>
      <Lottie animationData={animationData} loop={loop} lottieRef={lottieRef} />
    </div>
  );
};

export default LottiePlayer;
