import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/admin/admin-layout.tsx", [
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("subscription", "routes/admin/subscription.tsx"),
    route("meals-logs", "routes/admin/meals-logs.tsx"),
    route("settings", "routes/admin/settings.tsx"),
    route("payments", "routes/admin/payments.tsx"),
  ]),
        route('/auth/login', 'routes/auth/login.tsx'),
        route('/auth/signup', 'routes/auth/signup.tsx'),
] satisfies RouteConfig;
