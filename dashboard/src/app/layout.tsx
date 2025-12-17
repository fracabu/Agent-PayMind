import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayMind - AI Payment Reminder System",
  description: "Sistema intelligente di gestione automatica dei solleciti di pagamento basato su Agenti AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
