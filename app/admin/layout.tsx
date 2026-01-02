"use client";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full premium-bg">
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          {/* Glass Header with Sidebar Trigger */}
          <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-white/20 bg-white/60 backdrop-blur-xl px-6">
            <SidebarTrigger className="text-gray-600 hover:text-gold-600 hover:bg-gold-50/50 transition-colors" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-600">
              Panou de administrare
            </span>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl p-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
