"use client"

import { motion } from "framer-motion"
import { FaWhatsapp } from "react-icons/fa"

export function FloatingWhatsapp() {
  return (
    <motion.a
      href="https://wa.me/919990902748?text=Hi%20I%20am%20interested%20in%20booking%20a%20shoot"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="fixed bottom-11 right-8 z-50 group"
    >
      {/* Outer subtle pulse ring */}
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute inset-0 rounded-full border border-gold"
      />

      {/* Main Button */}
      <div className="relative flex items-center justify-center rounded-full bg-background border border-border p-2 shadow-lg transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(198,168,94,0.4)]">
        <FaWhatsapp className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-gold" />
      </div>
    </motion.a>
  )
}