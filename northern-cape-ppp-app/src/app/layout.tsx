import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boegoe Baai Gemeenskapsapp",
  description:
    "’n Digitale platform wat inwoners, plaaslike besighede, beleggers, werksoekers en die openbare sektor verbind vir inklusiewe nywerheidsontwikkeling en ekonomiese groei in Boegoe Baai.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="af">
      <body className="antialiased">{children}</body>
    </html>
  );
}
