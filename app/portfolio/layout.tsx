import { AppLayout } from "@/app/layout";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>;
} 