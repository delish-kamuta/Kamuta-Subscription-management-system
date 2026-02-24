import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // Protected layout: requires login and appropriate roles
  layout("routes/admin/admin-layout.tsx", [
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("wallet", "routes/admin/wallet.tsx"),
    route("profile", "routes/admin/profile.tsx"),
    route("my-qr-code", "routes/admin/my-qr-code.tsx"),
    route("scan-qr", "routes/admin/scan-qr.tsx"),
    route("subscription", "routes/admin/subscription.tsx"),
    route("meals-logs", "routes/admin/meals-logs.tsx"),
    route("settings", "routes/admin/settings.tsx"),
    route("payments", "routes/admin/payments.tsx"),
    route("restaurant-dashboard", "routes/admin/restaurant-dashboard.tsx"),
    route("dairy-usage-report", "routes/admin/dairy-usage-report.tsx"), // Added new route
    route("manage-stock", "routes/admin/manage-stock.tsx"),
    route("view-profit-report", "routes/admin/view-profit-report.tsx"), // Added new route
    route("manage-chefs", "routes/admin/manage-chefs.tsx"),
    route("users", "routes/admin/users.tsx"),
    route("branches", "routes/admin/branches.tsx"),
    route("feedback", "routes/admin/feedback.tsx"),
  ]),
  route("/auth/login", "routes/auth/login.tsx"),
  route("/auth/signup", "routes/auth/signup.tsx"),
  route("/unauthorized", "routes/unauthorized.tsx"),
] satisfies RouteConfig;
