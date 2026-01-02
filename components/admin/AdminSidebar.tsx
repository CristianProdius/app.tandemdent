"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Panou principal",
    href: "/admin",
    icon: "/assets/icons/appointments.svg",
  },
  {
    label: "Programări",
    href: "/admin/appointments",
    icon: "/assets/icons/calendar.svg",
  },
  {
    label: "Pacienți",
    href: "/admin/patients",
    icon: "/assets/icons/user.svg",
  },
  {
    label: "Medici",
    href: "/admin/doctors",
    icon: "/assets/icons/doctor.svg",
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin">
          <h1 className="text-xl font-semibold text-gold-600">Tandem Dent</h1>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold-50 text-gold-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className={cn(
                  "opacity-70",
                  isActive && "opacity-100"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Image
            src="/assets/icons/close.svg"
            alt="Ieșire"
            width={16}
            height={16}
          />
          Ieșire din administrare
        </Link>
      </div>
    </aside>
  );
};
