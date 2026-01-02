"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet, WalletMultiButton } from "@/contexts/WalletContext";
import { Trees, BarChart3, Users, HelpCircle } from "lucide-react";

export default function Navbar() {
  const { connected } = useWallet();
  const pathname = usePathname();

  const navItems = [
    { href: "/grove", label: "Grove", icon: Trees },
    { href: "/statistics", label: "Statistics", icon: BarChart3 },
    { href: "/community", label: "Community", icon: Users },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🍊</span>
            <span className="text-xl font-bold gradient-text">Orange</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 !rounded-lg !h-10" />
        </div>
      </div>
    </nav>
  );
}
