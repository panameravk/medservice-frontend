import type { Metadata } from "next";
import "./globals.css";
import { Roboto_Flex } from "next/font/google";

export const metadata: Metadata = {
  title: "MedService",
  description: "Управление отзывами",
};

const robotoFlex = Roboto_Flex({
  subsets: ["cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={robotoFlex.className}>{children}</body>
    </html>
  );
}
