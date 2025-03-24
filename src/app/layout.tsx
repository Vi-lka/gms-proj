import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Providers from "~/components/providers/Providers";

// TODO: bug tracker
// TODO: float number formating?
// TODO: customers styles (waiting...)

export const metadata: Metadata = {
  title: "ГМС",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html 
      lang="ru" 
      suppressHydrationWarning
      className={`${GeistSans.variable}`}
    >
      {/* {env.NODE_ENV === "development" && <ReactScan />} */}
      <body className="font-sans">
        <Providers>
          <div className="bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
