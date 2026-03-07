import Link from "next/link"
import { Camera, Instagram, Mail } from "lucide-react"

const quickLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/projects", label: "Projects" },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const socialLinks = [
  { href: "https://instagram.com/explorewithframes", label: "Instagram", icon: "instagram" },
  { href: "https://x.com/yourusername", label: "X", icon: "x" },
  { href: "mailto:explorewithframes7@gmail.com", label: "Gmail", icon: "gmail" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-gold" />
              <span className="font-serif text-xl tracking-wide text-foreground">
                Explore With Frames
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Capturing timeless moments through the art of photography. Every
              frame tells a story worth remembering.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium uppercase tracking-widest text-foreground">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social & Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium uppercase tracking-widest text-foreground">
              Connect
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-gold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon === "instagram" && <Instagram className="h-4 w-4" />}
                  {social.icon === "x" && (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {social.icon === "gmail" && (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.641l8.073-6.148C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              explorewithframes7@gmail.com
            </p>
            <p className="text-sm text-muted-foreground">
              Based in Delhi NCR, Available Worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {"© 2026 Explore With Frames Studio. All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground/50">
              Powered by <span className="text-gold/70">Abhijeet Kumar Singh</span>
            </p>
            <Link
              href="/admin/login"
              className="text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}