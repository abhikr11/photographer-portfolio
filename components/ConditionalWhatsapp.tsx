"use client"

import { usePathname } from "next/navigation"
import { FloatingWhatsapp } from "@/components/FloatingWhatsapp"

export function ConditionalWhatsapp() {
  const pathname = usePathname()

  // Hide on all admin routes
  if (pathname.startsWith("/admin")) return null

  return <FloatingWhatsapp />
}