export function isSuperAdminRole(role: unknown): boolean {
    return role === 'SuperAdmin' || role === 'Super Admin';
}

export function isManagerHCRole(role: unknown): boolean {
    return role === 'Manager HC';
}

export function canAccessHumanCapitalOperations(user: {
    role?: unknown;
} | null | undefined): boolean {
    if (!user) {
        return false;
    }
    return isSuperAdminRole(user.role);
}

export function canAccessVacancyWorkflow(user: {
    role?: unknown;
} | null | undefined): boolean {
    return (
        canAccessHumanCapitalOperations(user) ||
        isManagerHCRole(user?.role)
    );
}
