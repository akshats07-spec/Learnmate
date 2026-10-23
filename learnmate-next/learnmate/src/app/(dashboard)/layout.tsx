import { DashboardSidebar } from "@/components/nav/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-slate-100 flex flex-col lg:flex-row">
      <DashboardSidebar />
      <main className="flex-1 lg:pl-64 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
