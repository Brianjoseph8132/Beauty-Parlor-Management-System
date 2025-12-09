import { motion } from "framer-motion";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Us",
      details: ["123 Beauty Street", "Nairobi, Kenya"],
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["+254 123 456 789", "+254 987 654 321"],
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["info@bpms.com", "support@bpms.com"],
    },
    {
      icon: "🕐",
      title: "Working Hours",
      details: ["Mon - Fri: 9:00 AM - 7:00 PM", "Sat - Sun: 10:00 AM - 6:00 PM"],
    },
  ];

  const socialLinks = [
    { icon: "f", name: "Facebook", url: "#" },
    { icon: "📷", name: "Instagram", url: "#" },
    { icon: "𝕏", name: "Twitter", url: "#" },
    { icon: "in", name: "LinkedIn", url: "#" },
  ];

  return (
    <div className="bg-[#272727] min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#EFD09E] py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[#272727]">
              Get In <span className="text-[#D4AA7D]">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#272727]/80 leading-relaxed">
              We'd love to hear from you. Reach out to us for bookings, inquiries, or just to say hello.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-[#EFD09E]/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#D4AA7D]/20"
              >
                <div className="text-5xl mb-4">{info.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-[#D4AA7D]">
                  {info.title}
                </h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-[#EFD09E]/80 text-sm">
                    {detail}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#D4AA7D]">
                Send Us a Message
              </h2>
              <p className="text-[#EFD09E]/80 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[#EFD09E] mb-2 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[#EFD09E] mb-2 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[#EFD09E] mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    placeholder="+254 123 456 789"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-[#EFD09E] mb-2 font-medium">
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                  >
                    <option value="">Select a service</option>
                    <option value="cosmetics">Cosmetics</option>
                    <option value="hairdressing">Hairdressing</option>
                    <option value="barber">Barber</option>
                    <option value="massage">Massage</option>
                    <option value="body-treatment">Body Treatment</option>
                    <option value="aromatherapy">Aromatherapy</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[#EFD09E] mb-2 font-medium">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition resize-none"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-[#D4AA7D] text-[#272727] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            {/* Map & Social Links */}
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#D4AA7D]">
                  Find Us
                </h2>
                <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#D4AA7D]/30">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.35846873497!2d36.70730744863281!3d-1.3028618999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="BPMS Location"
                  ></iframe>
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-[#D4AA7D]">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      className="w-14 h-14 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-full flex items-center justify-center text-[#EFD09E] hover:bg-[#D4AA7D] hover:text-[#272727] transition text-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
                <p className="text-[#EFD09E]/70 mt-6 text-sm">
                  Stay connected with us on social media for the latest updates, beauty tips, and exclusive offers.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#D4AA7D]">
              Ready to Book?
            </h2>
            <p className="text-lg text-[#EFD09E]/80 mb-8">
              Don't wait! Schedule your appointment today and experience the BPMS difference.
            </p>
            <motion.button
              className="bg-[#D4AA7D] text-[#272727] px-10 py-4 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Appointment
            </motion.button>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
};

export default Contact;