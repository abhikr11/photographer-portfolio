"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { HeroSection } from "@/components/hero-section"
import { FeaturedGallery } from "@/components/featured-gallery"
import { Section, SectionHeader } from "@/components/section"

export default function HomePage() {
  return (
    <main>
      <ScrollProgress />
      <Navbar />
      <HeroSection />

      {/* Featured Gallery */}
      <FeaturedGallery />

      {/* About Preview */}
      <Section className="py-24">
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
                alt="Photographer at work"
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
              About the Artist
            </p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl text-balance">
              Stories Told Through Light and Shadow
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              With over five years of experience behind the lens, I believe every
              moment holds a story waiting to be told. My approach blends
              documentary authenticity with artistic vision, creating images that
              resonate with emotion and timelessness.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              From intimate portraits to grand celebrations, I bring a
              thoughtful eye and a passion for light that transforms fleeting
              moments into lasting art.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-fit rounded-none border-foreground/20 px-8 text-sm uppercase tracking-widest text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
            >
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* Booking CTA */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1920&h=600&fit=crop)",
          }}
        >
          <div className="absolute inset-0 bg-background/85" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              Ready to Create Something Beautiful?
            </p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-foreground md:text-4xl text-balance">
              {"Let's Capture Your Story"}
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              Whether it's a wedding, portrait session, or travel project, I'd
              love to hear about your vision.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-gold text-background hover:bg-gold-light rounded-none px-10 py-6 text-sm uppercase tracking-widest"
            >
              <Link href="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
