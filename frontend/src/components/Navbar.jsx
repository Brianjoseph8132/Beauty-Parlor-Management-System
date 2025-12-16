import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in (you can replace this with your auth logic)
  // const [isLoggedIn, setIsLoggedIn] = useState(true); // Change to false if not logged in
  const{ logout, current_user } = useContext(UserContext)

  const isActive = (path) => location.pathname === path;

  // const handleLogout = () => {
  //   // Add your logout logic here
  //   console.log("User logged out");
  //   setIsLoggedIn(false);
  //   navigate("/login");
  //   setMobileMenuOpen(false);
  // };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 w-full left-0 bg-[#272727]/90 shadow-md z-[9999] py-3">
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

              {/* Conditional Login/Signup or Logout */}
              {current_user ? (
                <>
                  <Link
                    to="/"
                    className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                    ${
                      isActive("/")
                        ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                        : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                    }`}
                  >
                    Home
                  </Link>
                  <motion.button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </>

              ) : (
                <>
                  <Link
                    to="/about"
                    className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                    ${
                      isActive("/about")
                        ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                        : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                    }`}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                    ${
                      isActive("/contact")
                        ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                        : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                    }`}
                  >
                    Contact
                  </Link>
                  <Link
                    to="/service"
                    className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                    ${
                      isActive("/service")
                        ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                        : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                    }`}
                  >
                    Service
                  </Link>
                  <Link
                    to="/login"
                    className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                    ${
                      isActive("/login")
                        ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                        : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                    ${
                      isActive("/signup")
                        ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                        : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
    

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

      {/* Sidebar (Mobile Only) */}
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
            {/* Mobile Conditional Login/Signup or Logout */}
            {current_user ? (
              <> 
                <Link
                  to="/"
                  className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                  ${
                    isActive("/")
                      ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                      : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <button
                  // onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>

            ) : (
              <>
                <Link
                  to="/about"
                  className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                  ${
                    isActive("/about")
                      ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                      : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                  ${
                    isActive("/contact")
                      ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                      : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                  ${
                    isActive("/login")
                      ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                      : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
                  ${
                    isActive("/signup")
                      ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                      : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>

            )}
                
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;