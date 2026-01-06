import { useLocation, Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import React from 'react';
import { SidebarTrigger } from "~/components/ui/sidebar";

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Helper to capitalize first letter
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // If we are at root, we might not want to show just "Home".
  // Or maybe we do.
  if (pathnames.length === 0) {
    return null; 
  }

  const customParents: Record<string, { label: string; href: string }[]> = {
    'wallet': [{ label: 'Subscription', href: '/subscription' }]
  };

  return (
    <div className="flex items-center gap-4 px-2 py-2 border-t border-gray-200">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Always show Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathnames.length > 0 && <BreadcrumbSeparator />}
          
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            
            // Basic formatting: replace hyphens with spaces and capitalize
            const title = value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const extraParents = customParents[value];

            return (
              <React.Fragment key={to}>
                 {/* Inject extras before the current item if defined for this segment */}
                 {extraParents && extraParents.map((crumb) => (
                    <React.Fragment key={crumb.href}>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={crumb.href}>{crumb.label}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </React.Fragment>
                 ))}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                        <Link to={to}>{title}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
