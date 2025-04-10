import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Providers from "~/components/providers/Providers";

// TODO: fix delete map item if else deleted!!
// TODO: collisions map items!
// TODO: fix zoom to group!
// TODO: scroll in popups
// TODO: change loading spinner?

export const metadata: Metadata = {
  title: "ГМС",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode,
}>) {

  return (
    <html 
      lang="ru" 
      suppressHydrationWarning
      className={`${GeistSans.variable}`}
    >
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