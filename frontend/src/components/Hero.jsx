import model from "../assets/images/model.png";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 inset-0 bg-gradient-to-r from-black to-[#D2B48C]">
      <div className="w-full">
        {/* Image on the right */}
        <div className="absolute right-0 top-0 h-full w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
          <img
            src={model}
            alt="model"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
        </div>

        {/* Text content */}
        <div className="relative z-10 text-center sm:text-left text-[#EFD09E] px-4 sm:px-8 lg:px-12 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto sm:mx-0 sm:-translate-x-0 md:translate-x-8 lg:translate-x-12">
          <motion.div
           animate={{rotate: [0, 360]}}
           transition={{duration:20,repeat: Infinity,ease: "linear"}}
           className="inline-block mb-6"
          >
          <Sparkles className="h-16 w-16 text-primary"/>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Welcome to BPMS
          </h1>
          <p className="text-base sm:text-lg md:text-lg mb-4 sm:mb-6 text-[#D4AA7D]">
            Experience a seamless, elegant, and modern beauty management system designed to bring your business to life.
          </p>
          <button className="bg-[#D4AA7D] text-[#272727] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition">
            Book Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;


















































// import model from "../assets/images/model.png";

// const Hero = () => {
//   return (
//     <section className="relative h-screen flex items-center justify-center  overflow-hidden px-6 inset-0 bg-gradient-to-r  from-black to-[#D2B48C]">
//       <div>
//         {/* Image on the right */}
//         <div className="absolute right-0 top-0 h-full w-1/2">
//           <img
//             src={model}
//             alt="model"
//             className="h-full w-full object-cover opacity-90"
//           />
//           <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
//         </div>

//         {/* Text content */}
//         <div className="relative z-10 text-center text-[#EFD09E] px-8 max-w-2xl -translate-x-45">
//           <h1 className="text-5xl font-bold mb-4">
//             Welcome to BPMS
//           </h1>
//           <p className="text-lg mb-6 text-[#D4AA7D]">
//             Experience a seamless, elegant, and modern beauty management system designed to bring your business to life.
//           </p>
//           <button className="bg-[#D4AA7D] text-[#272727] px-8 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition">
//             Book Now
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
