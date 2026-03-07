"use client"

import { useState } from "react"
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

export default function ContactPage() {
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    try {
      await fetch(process.env.NEXT_PUBLIC_CONTACT_FORM_URL!, {
        method: "POST",
        body: JSON.stringify(formData),
      })
      toast.success("Message sent!", {
        description: "Check your email for confirmation. I'll reply within 24 hours.",
      })
      setFormData({ name: "", email: "", mobile: "", subject: "", message: "" })
    } catch (err) {
      toast.error("Failed to send. Please email directly.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main>
      <ScrollProgress />
      <Navbar />

      <div className="pt-32 pb-8">
        <SectionHeader
          title="Get in Touch"
          subtitle="Have a project in mind? I'd love to hear about your vision."
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

              {/* Name + Email */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                  />
                </div>
              </div>

              {/* Mobile + Subject */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mobile" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subject" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project..."
                  className="rounded-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-fit bg-gold text-background hover:bg-gold-light rounded-none px-8 py-5 text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {sending ? "Sending..." : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-8 lg:col-span-2"
          >
            {/* Contact details */}
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-gold">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
                  <a
                    href="mailto:explorewithframes7@gmail.com"
                    className="mt-1 text-foreground hover:text-gold transition-colors"
                  >
                    explorewithframes7@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-gold">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Phone</p>
                  <a
                    href="tel:9783629580"
                    className="mt-1 text-foreground hover:text-gold transition-colors"
                  >
                    9783629580 / 9990902748
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-gold">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Location</p>
                  <p className="mt-1 text-foreground">Noida, Delhi NCR</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Availability */}
            <div className="border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Currently Available
                </p>
              </div>
              <p className="text-sm text-foreground">
                Open for new projects and collaborations.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Typical response within 24 hours.
              </p>
            </div>

          </motion.div>
        </div>
      </Section>

      <Footer />
    </main>
  )
}