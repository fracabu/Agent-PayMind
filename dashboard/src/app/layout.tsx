import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayMind - AI Payment Reminder System",
  description: "Sistema intelligente di gestione automatica dei solleciti di pagamento basato su Agenti AI",
};

// Script to apply theme before React hydrates to prevent flash
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('paymind-storage');
      if (stored) {
        var parsed = JSON.parse(stored);
        // Zustand persist stores directly or under 'state' key depending on version
        var theme = parsed.theme || (parsed.state && parsed.state.theme);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.error('Theme script error:', e);
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
