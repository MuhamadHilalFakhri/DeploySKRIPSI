interface AccountStatsProps {
    stats: {
        total: number;
        super_admin: number;
        manager_hc: number;
        admin: number;
        staff: number;
        pelamar: number;
    };
}

const labels: { key: keyof AccountStatsProps['stats']; label: string }[] = [
    { key: 'total', label: 'Total Accounts' },
    { key: 'super_admin', label: 'Super Admin' },
    { key: 'manager_hc', label: 'Manager HC' },
    { key: 'admin', label: 'Admin' },
    { key: 'staff', label: 'Staff' },
    { key: 'pelamar', label: 'Pelamar' },
];

export default function AccountStats({ stats }: AccountStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
            {labels.map((item) => (
                <div key={item.key} className="rounded-lg border bg-white p-2 shadow-sm md:p-4">
                    <p className="truncate text-[9px] uppercase tracking-wide text-slate-500 md:text-xs">{item.label}</p>
                    <p className="mt-0.5 text-lg font-semibold text-blue-900 md:mt-1 md:text-2xl">{stats[item.key]}</p>
                </div>
            ))}
        </div>
    );
}
