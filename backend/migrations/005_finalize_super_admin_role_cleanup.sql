UPDATE users
SET role = 'Super Admin', updated_at = NOW()
WHERE role = 'Admin HC' OR email = 'adminhc@admin.com';
