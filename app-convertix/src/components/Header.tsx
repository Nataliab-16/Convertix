"use client"
import Link from "next/link";

export function Header() {
    return (
        <nav className="w-full bg-convertix-primary">
            <div className="flex mx-auto p-4">
                <Link href="/" className="flex items-center mx-auto">
                    <img src="./colorido_png.png" className="h-30 w-40 sm:h-20 sm:w-30" alt="Logo" />
                </Link>
            </div>
        </nav>
    )
}