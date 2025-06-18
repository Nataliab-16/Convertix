"use client"
import Link from "next/link";

export function Header() {
    return (
        <nav className="w-full flex bg-convertix-primary border-gray-200 poppins-regular">
            <div className="justify-between items-center mx-auto max-w-screen-xl p-4">
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="./colorido_png.png" className="h-30 w-40" alt="Logo" />
                </Link>
            </div>
        </nav>
    )
}