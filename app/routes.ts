import { type RouteConfig, index ,route , layout} from "@react-router/dev/routes";

export default [
        layout('routes/admin/admin-layout.tsx', [
            route('dashboard', 'routes/admin/dashboard.tsx'),
            route('all-clients', 'routes/admin/all-users.tsx'),
            route('settings','routes/admin/settings.tsx'),
            route('payments','routes/admin/payments.tsx')
        ]),
] satisfies RouteConfig;