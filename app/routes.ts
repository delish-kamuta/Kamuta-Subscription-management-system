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
    route("my-qr-code", "routes/admin/my-qr-code.tsx"),
    route("scan-qr", "routes/admin/scan-qr.tsx"),
    route("subscription", "routes/admin/subscription.tsx"),
    route("meals-logs", "routes/admin/meals-logs.tsx"),
    route("settings", "routes/admin/settings.tsx"),
    route("payments", "routes/admin/payments.tsx"),
    route("users", "routes/admin/users.tsx"),
  ]),
  route("/auth/login", "routes/auth/login.tsx"),
  route("/auth/signup", "routes/auth/signup.tsx"),
  route("/unauthorized", "routes/unauthorized.tsx"),
] satisfies RouteConfig;
