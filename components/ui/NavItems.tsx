'use client'

import { NAV_ITEMS } from "@/lib/constant";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItems() {
    const pathname = usePathname()
    const isActivePath = (path: string) => {
        if (pathname === '/') {
            return path === '/'
        }
        return pathname.startsWith(path)
    }
  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-4 sm:gap-10 font-medium">
        {NAV_ITEMS.map((item) => ( 
            <li key={item.label} className="min-w-48">
                <Link href={item.href} className={`hover:text-primary transition-colors ${isActivePath(item.href) ? 'text-primary' : 'text-gray-400'}`}>
                    {item.label}
                </Link>
            </li>
        ))}
    </ul>
  )
}