import type { Metadata } from "next";
import "./globals.css";
import "./generator.css";

export const metadata: Metadata = {
  title: "Kalliom Content Engine",
  description: "Motor interno de carruseles para LinkedIn",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
