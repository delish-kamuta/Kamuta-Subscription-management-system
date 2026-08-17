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

  // Sync activeView from the URL both ways: management URL → management view,
  // any other URL (including /dashboard) → overview view. The SwitchDashboardButton
  // can still toggle to management while staying on /dashboard; because that click
  // doesn't change the URL, this effect won't fire and won't undo the toggle.
  useEffect(() => {
    const target = getViewForPath(location.pathname);
    if (activeView !== target) setActiveView(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
