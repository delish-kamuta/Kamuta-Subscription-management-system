-- 1. Create a Main Branch (Ignore if exists since it was likely created in the last run)
INSERT INTO "Branch" (id, name, campus, regular_price, vip_price, vvip_price, created_at)
VALUES 
('e2badfe3-4b16-4ed9-bc52-118cd8c19177', 'Main Branch', 'Main Campus', 1000, 1500, 2000, NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create the Admin User (using uppercase 'ADMIN' to match Frontend Enum)
-- Password is: password123
INSERT INTO "User" (id, full_name, phone, password_hash, role, branch_id, created_at, updated_at)
VALUES (
    'f1b7d83a-c79c-4a01-92ea-fbbf898e48df', 
    'System Admin', 
    '0700000000', 
    '$2b$10$XLLxthtzoMhvEymX916WuOkHioJBMpnofglBQxvTnO/keL8m63tu2', 
    'admin'::"UserRole", 
    'e2badfe3-4b16-4ed9-bc52-118cd8c19177', 
    NOW(), 
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::"UserRole",
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- 3. Verify the creation
SELECT full_name, phone, role FROM "User";