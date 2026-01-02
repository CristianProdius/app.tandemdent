"use client";

import { Calendar, Home, LogOut, Stethoscope, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Panou principal",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Programări",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    label: "Pacienți",
    href: "/admin/patients",
    icon: Users,
  },
  {
    label: "Medici",
    href: "/admin/doctors",
    icon: Stethoscope,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="glass-sidebar border-r-0"
    >
      {/* Header with logo */}
      <SidebarHeader className="border-b border-white/20">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold-glow-sm">
            <Image
              src="/assets/icons/logo.png"
              alt="Tandem Dent"
              width={24}
              height={24}
              className="h-5 w-5 object-contain brightness-0 invert"
            />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold gold-text-gradient">
              Tandem Dent
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200",
                        isActive &&
                          "bg-gold-50/80 text-gold-700 border-l-2 border-gold-500 rounded-l-none"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "size-4",
                            isActive ? "text-gold-600" : "text-gray-500"
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Ieșire din administrare"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
            >
              <Link href="/">
                <LogOut className="size-4" />
                <span>Ieșire</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
