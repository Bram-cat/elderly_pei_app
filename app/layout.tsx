import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Charlottetown Odd Jobs | Connect Youth & Seniors",
  description:
    "Local marketplace connecting UPEI students and youth with seniors in Charlottetown for snow removal, moving help, yard work, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="h-full flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
