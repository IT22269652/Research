'use client';

import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Mic, Plus, LayoutDashboard, Calendar, FileText, Settings, Home } from "lucide-react"

const menuItems = [
  {
    title: "Home",
    icon: Home,
    url: "/",
  },
  
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/InterviewDashboard",
  },
  {
    title: "Scheduled Interview",
    icon: Calendar,
    url: "/scheduled-interview",
  },
  {
    title: "All Interview",
    icon: FileText,
    url: "/all-interview",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
  {
  title: "Interview Results",
  icon: FileText,
  url: "/InterviewDashboard/Results",
  },

]

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (url) => {
    return pathname === url || pathname.startsWith(url + '/');
  };

  return (
    <Sidebar className="bg-slate-900/95 backdrop-blur-lg border-r border-purple-500/10">
      <SidebarHeader className="p-6 border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-xl blur-md opacity-50"></div>
            <Mic className="w-6 h-6 text-white relative z-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              VoicePrep AI
            </span>
            <span className="text-sm text-gray-400">
              Interview Assistant
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-slate-900/95">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {/* Create New Interview Button */}
              <SidebarMenuItem className="mb-4">
                <SidebarMenuButton 
                  asChild 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 py-7 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <a href="/InterviewDashboard/CreateInterview" className="flex items-center gap-3">
                    <Plus className="w-6 h-6" />
                    <span className="text-base font-semibold">Create New Interview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Menu Items */}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url} 
                      className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all duration-200 ${
                        isActive(item.url)
                          ? 'bg-purple-600/20 border-l-4 border-purple-500 shadow-lg shadow-purple-500/10'
                          : 'hover:bg-white/5 border-l-4 border-transparent'
                      }`}
                    >
                      <item.icon 
                        className={`w-6 h-6 ${
                          isActive(item.url)
                            ? 'text-purple-400'
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      <span 
                        className={`text-base font-medium ${
                          isActive(item.url)
                            ? 'text-purple-300'
                            : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-purple-500/10 bg-slate-900/95">
        <div className="text-sm text-gray-500">
          © 2025 VoicePrep AI
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}