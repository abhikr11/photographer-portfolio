"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram, Twitter, Briefcase, GraduationCap, Award, FileText } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"
import { AnimatedCounter } from "@/components/animated-counter"

const stats = [
  { end: 4, suffix: "+", label: "Years Experience" },
  { end: 150, suffix: "+", label: "Projects Completed" },
  { end: 50, suffix: "+", label: "Happy Clients" },
  { end: 12, suffix: "", label: "Awards Won" },
]

const experience = [
  {
    date: "07/2025 - 02/2026",
    role: "Freelance Videographer",
    company: "Apple & Peaches Inc. & Others",
    description: "Collaborated with multiple advertising agencies on a project basis, shooting product content, corporate events, and fashion tours while delivering high-quality visuals aligned with campaign objectives."
  },
  {
    date: "02/2025 - 06/2025",
    role: "Videographer & Production Team Head",
    company: "DigitalInclined Private Limited",
    description: "Produced high-quality UGC video content, managed on-field shoots in industrial and corporate locations, and collaborated with fashion models and creative artists under tight deadlines."
  },
  {
    date: "12/2024 - 01/2025",
    role: "Marketing Executive (Videographer)",
    company: "Keys Multiplier",
    description: "Executed real estate marketing for developers like Bhutani Group and M3M, conducting on-field site visits for photography and videography at active construction properties."
  },
  {
    date: "03/2024 - 03/2024",
    role: "Production Team (Frames) Videographer",
    company: "Aloha 2024, DME College",
    description: "Captured cinematic event coverage, including live performances and behind-the-scenes footage, delivering high-quality highlight videos."
  },
  {
    date: "03/2024 - 03/2024",
    role: "Freelance Photographer",
    company: "Style Up 3.0",
    description: "Documented high-energy fashion moments, ramp walks, and detailed outfit shots in a fast-paced live environment."
  },
  {
    date: "12/2023 - 12/2023",
    role: "Fest Media Coverage Team Head",
    company: "Kuk Du Koo Fest, Noida",
    description: "Managed and coordinated video production and photography teams for a large-scale two-day children's fair."
  },
  {
    date: "08/2022 - 09/2022",
    role: "Photojournalist Intern",
    company: "Jagran Prakashan",
    description: "Documented ground-level visuals and public reactions during historic demolition events, providing impactful photographic coverage for news publication."
  }
]

const education = [
  {
    title: "BA in Journalism & Mass Communication",
    institution: "Delhi Metropolitan Education (GGSIPU)",
    year: "2021 - 2024"
  },
  {
    title: "Multi-Camera TV Studio Operation",
    institution: "Film and Television Institute of India (FTII)",
    year: "2024"
  },
  {
    title: "Secondary Education",
    institution: " Kendriya Vidyalaya No. 1, Bikaner",
    year: "2019 – 2021"
  },
  {
    title: "Primary Education",
    institution: "Kendriya Vidyalaya Sangathan (BSF) Anupgarh",
    year: "2009 – 2019"
  }
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
                alt="Portrait of Yash Joshi"
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
              The Visionary
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
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/explorewithframes"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              {/* Download Resume Button */}
              <a
                href="/Yash_Joshi_CV.pdf"
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold bg-gold/5 text-[10px] uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-background"
              >
                <FileText className="h-3.5 w-3.5" />
                Download Resume
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

      {/* NEW: Experience & Education Timeline Section */}
      <Section className="bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-gold text-center">
            Resume Details
          </p>

          <h2 className="text-3xl font-serif text-center mt-4">
            Professional Experience & Education
          </h2>

          <div className="mt-12 space-y-10 border-l pl-6">
            {/* Profile */}
            <div>
              <h3 className="font-semibold">Profile</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Creative professional with 4+ years experience in photography,
                videography, and event management. Skilled in DSLR, drones,
                storytelling and client collaboration.
              </p>
            </div>

            <div className="grid gap-16 lg:grid-cols-3">
              {/* Experience Column */}
              <div className="lg:col-span-2">
                <div className="mb-10 flex items-center gap-4">
                  <Briefcase className="h-6 w-6 text-gold" />
                  <h3 className="font-serif text-2xl text-foreground">Professional Experience</h3>
                </div>
                <div className="space-y-12 border-l border-border/50 pl-8">
                  {experience.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-2 border-gold bg-background" />
                      <span className="text-xs font-medium uppercase tracking-widest text-gold">{item.date}</span>
                      <h4 className="mt-2 text-xl font-medium text-foreground">{item.role}</h4>
                      <p className="text-sm font-medium text-muted-foreground/80 italic">{item.company}</p>
                      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar: Education, Research & Awards */}
              <div className="space-y-12">
                <div>
                  <div className="mb-8 flex items-center gap-4">
                    <GraduationCap className="h-6 w-6 text-gold" />
                    <h3 className="font-serif text-2xl text-foreground">Education</h3>
                  </div>
                  <div className="space-y-6">
                    {education.map((edu, i) => (
                      <div key={i} className="rounded-lg border border-border/40 p-5 transition-colors hover:bg-secondary/50">
                        <h4 className="font-medium text-foreground">{edu.title}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <p className="mt-1 text-xs text-gold">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-8 flex items-center gap-4">
                    <Award className="h-6 w-6 text-gold" />
                    <h3 className="font-serif text-2xl text-foreground">Research & Certifications</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gold/20 bg-gold/5 p-5">
                      <h4 className="text-sm font-semibold mb-2 text-gold">Published Research (2023)</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Presented 2 papers on <strong>Journalistic Transparency</strong> at Makhanlal Chaturvedi University, later published in a Mass Communication book by DME Noida.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/40 p-5">
                      <h4 className="text-sm font-semibold mb-2">Certification of Excellence</h4>
                      <p className="text-xs text-muted-foreground italic">"Our Planet Earth and Its Desertification"</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">Global Media Education Council (G-MEC), Oct 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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