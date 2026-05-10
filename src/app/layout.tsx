import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bolomj.space";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${rootDomain}`),
  title: "Bolomj - Аяллын вебсайт",
  description: "Bolomj tenant байгууллагуудын аяллын мэдээлэл, дэлгэрэнгүй хөтөлбөр, public захиалгын вебсайт.",
  applicationName: "Bolomj Tenant Site",
  openGraph: {
    title: "Bolomj - Аяллын вебсайт",
    description: "Bolomj tenant байгууллагуудын аяллын мэдээлэл, захиалгын вебсайт.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
