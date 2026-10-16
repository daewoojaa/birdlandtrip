import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

const plex = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});
const jam = Bai_Jamjuree({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ทริปเขาค้อ EX2",
  description: "บันทึกทริป ปากเกร็ด ⇄ Birdland Resort เขาค้อ 5–8 พ.ย. ด้วย Geely EX2",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: { capable: true, title: "ทริปเขาค้อ", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1D4F91",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plex.variable} ${jam.variable}`}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
