import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>SYNCART - Collaborative Drawing App</title>
        <meta name="description" content="Create, collaborate, and share your artwork in real-time with SYNCART" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
