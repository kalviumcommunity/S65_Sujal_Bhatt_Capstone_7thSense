import LottiePlayer from "../LottiePlayer";
import friends from "../../assets/lottie/friends.json";

function FriendsSection() {
  return (
    <div className="space-bg w-full py-24">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-12"
      >
        {/* Friends animation on the left */}
        <div
          className="flex-1 flex items-center justify-start"
        >
          <LottiePlayer animationData={friends} width={600} height={600} loop={true} />
        </div>
        {/* Text on the right */}
        <div
          className="flex-1 flex flex-col items-end justify-center text-right"
        >
          <h2
            className="text-5xl font-bold leading-tight text-right"
            style={{ fontFamily: "'Montserrat', 'Poppins', 'Inter', Arial, sans-serif" }}
          >
            <span className="text-[var(--space-text)]">Prove you're the sharpest</span>
            <span className="text-[var(--space-accent)]"> in your circle</span>
            <br />
            <span className="text-lg font-normal text-[var(--space-text-secondary)]">Challenge your friends — let the facts settle the debate.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default FriendsSection;
