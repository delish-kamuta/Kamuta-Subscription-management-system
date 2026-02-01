-- Check User table definition
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;

-- Check if any branches exist (needed for branch_id)
SELECT id, name FROM "Branch" LIMIT 5;