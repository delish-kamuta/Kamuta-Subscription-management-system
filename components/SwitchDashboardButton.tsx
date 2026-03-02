import { LayoutGrid } from "lucide-react";
import { useDashboardView } from "~/hooks/useDashboardView";
import { useAppSelector } from "~/store/hooks";
import { UserRole } from "~/types/auth";

export function SwitchDashboardButton() {
  const { activeView, toggleView } = useDashboardView();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  // Only show for admin users
  if (!isAdmin) return null;

  return (
    <button
      onClick={toggleView}
      className=" z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-gray-700 transition-colors shadow-md cursor-pointer"
      title={`Switch to ${activeView === "overview" ? "Management" : "Overview"} dashboard`}
    >
      <LayoutGrid className="h-4 w-4" />
      <span className="hidden sm:inline">Switch Dashboard</span>
    </button>
  );
}
