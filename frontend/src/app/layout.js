// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { ReduxProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OptionTrader - Real-time Option Chain",
  description: "Real-time option chain visualization with WebSocket data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
