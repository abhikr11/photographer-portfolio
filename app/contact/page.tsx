"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Send, MapPin, Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "explorewithframes7@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "9783629580 & 9990902748",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Noida",
  },
]

export default function ContactPage() {
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)

    setTimeout(() => {
      setSending(false)
      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      })
      ;(e.target as HTMLFormElement).reset()
    }, 1500)
  }

  return (
    <main>
      <ScrollProgress />
      <Navbar />

      <div className="pt-32 pb-8">
        <SectionHeader
          title="Get in Touch"
          subtitle="Have a project in mind? We'd love to hear about your vision."
        />
      </div>

      <Section className="pt-4">
        <div className="grid gap-16 lg:grid-cols-5">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="subject"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  placeholder="What's this about?"
                  className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="message"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell us about your project..."
                  className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-fit bg-gold text-background hover:bg-gold-light rounded-none px-8 py-5 text-sm uppercase tracking-widest"
              >
                {sending ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Contact info sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-8 lg:col-span-2"
          >
            <div className="flex flex-col gap-6">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-gold">
                    <info.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {info.label}
                    </p>
                    <p className="mt-1 text-foreground">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </Section>

      <Footer />
    </main>
  )
}
