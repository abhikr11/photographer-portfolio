"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram, Twitter } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"
import { AnimatedCounter } from "@/components/animated-counter"

const stats = [
  { end: 5, suffix: "+", label: "Years Experience" },
  { end: 150, suffix: "+", label: "Projects Completed" },
  { end: 50, suffix: "+", label: "Happy Clients" },
  { end: 12, suffix: "", label: "Awards Won" },
]

export default function AboutPage() {
  return (
    <main>
      <ScrollProgress />
      <Navbar />

      <div className="pt-32 pb-8">
        <SectionHeader title="About" subtitle="Stories Through the Lens." />
      </div>

      {/* Bio section */}
      <Section className="pt-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=1067&fit=crop"
                alt="Portrait of the photographer"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 h-full w-full border border-gold/30 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              The Photographer
            </p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl text-balance">
              Yash Joshi
            </h2>
            <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
              <p>
                Based in Delhi NCR, I am a professional photographer dedicated to capturing 
                powerful visuals that tell meaningful stories. With experience across news media, 
                product photography, and large-scale events, my work focuses on documenting moments 
                with authenticity, precision, and impact.
              </p>
              <p>
                My background includes working in fast-paced news and media environments, where timing, 
                awareness, and storytelling are essential. I have covered a wide range of assignments 
                including defence exhibitions, political events, public gatherings, and official programs, 
                capturing moments that hold social, cultural, and historical significance.
              </p>
              <p>
                Alongside editorial and event coverage, I also specialize in product photography, creating 
                clean and visually engaging imagery that highlights design, detail, and brand identity.
              </p>
              <p>
                Through my lens, I aim to combine technical excellence with a strong narrative perspective, 
                ensuring every photograph communicates emotion, context, and purpose. Whether documenting 
                real-time events or producing refined commercial visuals, my goal is always to deliver 
                imagery that is both impactful and timeless.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/explorewithframes"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-gold"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Stats */}
      <Section>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <AnimatedCounter
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
              />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Philosophy */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">
            Philosophy
          </p>
          <blockquote className="mt-6 font-serif text-2xl italic leading-relaxed text-foreground md:text-3xl text-balance">
            {'"Photography is the story I fail to put into words."'}
          </blockquote>
          <p className="mt-4 text-muted-foreground">- Destin Sparks</p>
        </div>
      </Section>

      <Footer />
    </main>
  )
}
