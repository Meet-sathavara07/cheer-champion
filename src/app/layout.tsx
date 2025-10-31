import type { Metadata } from "next";
import { Inter, Libre_Franklin, Comfortaa } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { FormProvider } from "./context/KudoPostContext";
import { UserProvider } from "./context/UserContext";
import { InstantDBProvider } from "./context/InstantProvider";
import { openGraphMetaData, twitterMetaData } from "./shared-metadata";
import { LanguageProvider } from "./context/LanguageContext";
import VersionChecker from "./components/Wrappers/VersionChecker";
import { CountryCodeProvider } from "./context/CountryCodeContext";
import Script from "next/script";
import ConsentModalManager from "./components/Modals/ConsentModalManager";
import DownloadAppModalManager from "./components/Modals/DownloadAppModalManager";
import StoreWebPushToken from "./components/Wrappers/StoreWebPushToken";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const libre = Libre_Franklin({
  variable: "--font-libre",
  subsets: ["latin"],
});
const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

const baseURL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://cheer-champion.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: {
    default: "Cheer Champion - Spread Gratitude with Kudos",
    template: "%s | Cheer Champion",
  },
  description:
    "Recognize and appreciate acts of kindness with Cheer Champion. Join the movement to spread gratitude!",
  openGraph: {
    ...openGraphMetaData,
  },
  twitter: {
    ...twitterMetaData,
  },
  verification: {
    google: "wXnCq5VWMbQNbswfvjCsqarXYfLSy5NvPGVaB37CBpE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-WDDE6ZCHH1"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}   
              gtag('js', new Date());   
              gtag('config', 'G-WDDE6ZCHH1');
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${libre.variable} ${comfortaa.variable}`}
      >
        <Toaster />
        <InstantDBProvider>
          <UserProvider>
            <FormProvider>
              <LanguageProvider>
                <CountryCodeProvider>
                  <VersionChecker />
                  <ConsentModalManager />
                  <DownloadAppModalManager />
                  <StoreWebPushToken />
                  <main className="overflow-x-hidden">{children}</main>
                </CountryCodeProvider>
              </LanguageProvider>
            </FormProvider>
          </UserProvider>
        </InstantDBProvider>
      </body>
    </html>
  );
}
