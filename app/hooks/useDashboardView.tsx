import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import { sidebarItems } from "~/constants";

export type DashboardView = "overview" | "management";

interface DashboardViewContextType {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  toggleView: () => void;
}

const DashboardViewContext = createContext<DashboardViewContextType>({
  activeView: "overview",
  setActiveView: () => {},
  toggleView: () => {},
});

// Routes that belong to the management dashboard
const managementRoutes = sidebarItems
  .filter((item) => item.dashboard === "management" && item.href !== "/dashboard")
  .map((item) => item.href);

function getViewForPath(pathname: string): DashboardView {
  const path = "/" + pathname.replace(/^\/+/, "").split("/")[0];
  return managementRoutes.includes(path) ? "management" : "overview";
}

export function DashboardViewProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [activeView, setActiveView] = useState<DashboardView>(() => getViewForPath(location.pathname));

  // Sync activeView when navigating to a route that belongs to a different dashboard
  useEffect(() => {
    const viewForRoute = getViewForPath(location.pathname);
    // Only auto-switch if the current route explicitly belongs to the other dashboard
    const path = "/" + location.pathname.replace(/^\/+/, "").split("/")[0];
    const isExplicitRoute = managementRoutes.includes(path);
    if (isExplicitRoute && activeView !== "management") {
      setActiveView("management");
    }
  }, [location.pathname]);

  const toggleView = () => {
    setActiveView((prev) => (prev === "overview" ? "management" : "overview"));
  };

  return (
    <DashboardViewContext.Provider value={{ activeView, setActiveView, toggleView }}>
      {children}
    </DashboardViewContext.Provider>
  );
}

export function useDashboardView() {
  return useContext(DashboardViewContext);
}
