"use client"
import Link from "next/link";

export function Header() {
    return (
        <nav className=" bg-convertix-primary border-gray-200 poppins-regular">
            <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="./colorido_png.png" className="h-30 w-40 m-4" alt="Logo" />
                </Link>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    
                </div>
            </div>
        </nav>
    )
}