import { Nav } from "@/components/layout/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav />
      {/* pb-20 = nav height; safe area adds extra space for iOS home indicator */}
      <main
        className="flex-1 overflow-y-auto md:pb-0"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
    </div>
  );
}
