import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Roboto } from "next/font/google";

const font = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "RealState - 3D",
  description: "REALSTATe website with 3D models",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className='dark'>
      <body className={font.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}