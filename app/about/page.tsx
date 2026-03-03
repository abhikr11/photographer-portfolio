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
        <SectionHeader title="About" subtitle="The story behind the lens." />
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
              Alex Morgan
            </h2>
            <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
              <p>
                Based in New York with a passion for storytelling through
                imagery, I have spent over five years refining my craft across
                diverse genres of photography. From the intimate moments of a
                wedding day to the vast landscapes of distant travels, I seek to
                find beauty in the authentic.
              </p>
              <p>
                My approach is rooted in natural light and genuine emotion. I
                believe the best photographs are not posed but discovered in the
                spaces between moments, where real life unfolds in its most
                compelling form.
              </p>
              <p>
                When not behind the camera, you can find me exploring new cities,
                hunting for the perfect cup of coffee, or teaching workshops on
                visual storytelling.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
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
