"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/AppointmentDoctor", label: "نوبت‌ها" },
  { href: "/Setting", label: "تنظیمات" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-[200px] md:shrink-0 md:border-b-0 md:border-s">
      <div className="px-5 pb-2 pt-5 md:pb-0 md:pt-7">
        <p className="text-sm font-bold text-slate-900">
          مطب دکتر کریمی
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 pt-3 md:flex-col md:overflow-visible md:pb-0 md:pt-9">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-[#e1f0f1] font-bold text-[#0b6e75]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}