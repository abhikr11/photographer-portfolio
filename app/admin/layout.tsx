"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Camera,
  LayoutDashboard,
  ImageIcon,
  Video,
  FolderOpen,
  LogOut,
  ChevronLeft,
  Settings,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Images", href: "/admin/dashboard/images", icon: ImageIcon },
  { title: "Videos", href: "/admin/dashboard/videos", icon: Video },
  { title: "Categories", href: "/admin/dashboard/categories", icon: FolderOpen },
  { title: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Login page renders without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" })
    router.replace("/admin/login")
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold" />
            <span className="font-serif text-lg text-sidebar-foreground">
              Explore With Frames
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Site">
                <Link href="/">
                  <ChevronLeft />
                  <span>Back to Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="px-2 py-3 border-t border-sidebar-border mb-2">
            <p className="text-xs text-muted-foreground">Powered by</p>
            <p className="text-xs font-medium text-gold">Abhijeet Kumar Singh</p>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-6">
          <SidebarTrigger className="-ml-2" />
          <span className="text-sm font-medium text-foreground">
            {navItems.find((item) => item.href === pathname)?.title ?? "Admin"}
          </span>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}