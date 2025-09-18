"use client"
import Link from "next/link";
import Image from "next/image";
export function Header() {
    return (
        <nav className="w-full bg-convertix-primary">
            <div className="flex mx-auto p-4">
                <Link href="/" className="flex items-center mx-auto">
                    <Image src="/colorido_png.png" alt="Logo Convertix" className="my-1" width={200} height={10} />
                </Link>
            </div>
        </nav>
    )
}