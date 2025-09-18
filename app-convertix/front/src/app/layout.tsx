import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Poppins } from "next/font/google";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Convértix - Monitoramento de Conversões",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br" className={`w-full p-0 m-0 ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css" rel="stylesheet" />
      </head>
      <body className="poppins-regular">
        <Header />
        {children}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js"
          async
          defer
        ></script>
      </body>
    </html>
  );
}
