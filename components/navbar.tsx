"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, Instagram } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/projects", label: "Projects" },
  { href: "/videos", label: "Videos" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Explore With Frames"
            width={120}
            height={120}
            priority
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col justify-center leading-none">
            <span className="font-serif text-xl tracking-wider">
              Explore <span className="text-gold">With Frames</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold/60 mt-0.5">
              — by Yash Joshi
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm tracking-widest uppercase transition-colors duration-300 ${
                  pathname === link.href
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="mx-6 h-4 w-px bg-border" />

          <motion.a
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300 }}
            href="https://instagram.com/explorewithframes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-gold transition-colors duration-300"
          >
            <Instagram className="h-5 w-5" />
          </motion.a>
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 bg-background border-border">
            <SheetTitle className="sr-only">Navigation</SheetTitle>

            <div className="flex flex-col gap-6 pt-8">
              <Link
                href="/"
                className="flex items-center gap-2 px-4"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/logo.png"
                  alt="Explore With Frames"
                  width={120}
                  height={120}
                  priority
                  className="h-10 w-auto object-contain"
                />
                <div className="flex flex-col justify-center leading-none">
                  <span className="font-serif text-xl text-foreground">
                    Explore With Frames
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold/60 mt-0.5">
                    — by Yash Joshi
                  </span>
                </div>
              </Link>

              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 text-sm tracking-widest uppercase transition-colors ${
                      pathname === link.href
                        ? "text-gold bg-gold/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mx-4 my-2 h-px bg-border" />

              <motion.a
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="https://instagram.com/explorewithframes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 text-muted-foreground hover:text-gold transition-colors duration-300"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </motion.a>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  )
}