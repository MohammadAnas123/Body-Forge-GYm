import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      
      {/* Animation container with relative positioning */}
      <div className="relative w-full max-w-lg h-[40vh] sm:h-[50vh] md:h-[60vh]">
        <DotLottieReact
          src="https://lottie.host/319b1652-1056-4274-a672-2182360649c8/Jce0PFYZlM.lottie"
          loop
          autoplay
          className="w-full h-full"
        />

        {/* Absolute positioned Return to Home link */}
        <a
          href="/"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-blue-500 hover:text-blue-700 underline text-sm sm:text-lg font-medium"
        >
          Return to Home
        </a>
      </div>

    </div>
  );
};

export default NotFound;
