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
    route("users", "routes/admin/users.tsx"),
    route("branches", "routes/admin/branches.tsx"),
    route("feedback", "routes/admin/feedback.tsx"),
    // Phase 1 — Store & Shop
    route("store", "routes/admin/store.tsx"),
    route("store/count", "routes/admin/store-count.tsx"),
    route("shop", "routes/admin/shop.tsx"),
    // Phase 2 — Products, Yield standards, Reconciliation (buffet lives inside /scan-qr)
    route("products", "routes/admin/products.tsx"),
    route("yield-standards", "routes/admin/yield-standards.tsx"),
    route("reconciliation", "routes/admin/reconciliation.tsx"),
    route("financial-overview", "routes/admin/financial-overview.tsx"),
    route("orders", "routes/admin/orders.tsx"),
    route("payroll", "routes/admin/payroll.tsx"),
  ]),
  route("/auth/login", "routes/auth/login.tsx"),
  route("/auth/signup", "routes/auth/signup.tsx"),
  route("/unauthorized", "routes/unauthorized.tsx"),
] satisfies RouteConfig;
