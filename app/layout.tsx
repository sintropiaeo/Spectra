import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { getAlertasResumen } from "@/app/alertas/actions";
import { NAV_ITEMS } from "@/lib/types";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPECTRA",
  description: "Sistema de gestión comercial SPECTRA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let perfil = null;
  let alertCount = 0;
  if (user) {
    const [perfilRes, alertas] = await Promise.all([
      supabase.from("perfiles").select("*").eq("id", user.id).single(),
      getAlertasResumen(),
    ]);
    perfil = perfilRes.data;
    alertCount = alertas.total;
  }

  const navItems = NAV_ITEMS.filter(
    (item) => !item.roles || (perfil?.rol && item.roles.includes(perfil.rol))
  );

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${user ? "flex" : ""} h-full bg-gray-50 text-gray-900`}>
        {user && <Sidebar perfil={perfil} alertCount={alertCount} navItems={navItems} />}
        <main className={user ? "flex-1 overflow-auto p-8" : ""}>{children}</main>
      </body>
    </html>
  );
}
