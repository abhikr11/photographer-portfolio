import Link from "next/link"
import { Camera, Instagram, Twitter } from "lucide-react"

const quickLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/projects", label: "Projects" },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const socialLinks = [
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "Twitter", icon: Twitter },
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-gold"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
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
