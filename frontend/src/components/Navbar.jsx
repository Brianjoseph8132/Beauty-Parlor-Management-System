import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 🟨 Main Navbar */}
      <nav className="fixed top-0 w-full left-0 bg-[#272727]/90  shadow-md z-[9999] py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div
              className="flex items-center space-x-2 -ml-3"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.3,
              }}
            >
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Sparkles className="h-8 w-8 text-[#D4AA7D]" />
              </motion.div>

              <div className="font-playfair text-3xl font-bold text-[#D4AA7D] tracking-wider drop-shadow-sm">
                BPMS
              </div>
            </motion.div>

            {/* Desktop Nav Links */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.8,
              }}
              className="hidden md:flex items-center space-x-6"
            >
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
                { name: "Login", path: "/login" },
                { name: "Sign Up", path: "/signup" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                  ${
                    isActive(link.path)
                      ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                      : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>

            {/* Mobile Menu Icon */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 text-[#EFD09E] cursor-pointer" />
              ) : (
                <FiMenu className="w-6 h-6 text-[#EFD09E] cursor-pointer" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 🟨 Sidebar (Mobile Only) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9990]">
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div
            className="absolute top-0 right-0 w-[180px] h-full
                      bg-[#272727]/95 border-l border-[#D4AA7D]/30
                      backdrop-blur-sm flex flex-col items-center justify-center 
                      space-y-4 shadow-lg"
          >
            {[
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
              { name: "Contact", path: "/contact" },
              { name: "Login", path: "/login" },
              { name: "Sign Up", path: "/signup" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                ${
                  isActive(link.path)
                    ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                    : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
