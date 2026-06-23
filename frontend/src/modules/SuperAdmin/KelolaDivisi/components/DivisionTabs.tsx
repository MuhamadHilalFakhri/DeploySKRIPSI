import { Building2 } from 'lucide-react';

import type {
    DivisionJob,
    DivisionRecord,
} from '@/modules/SuperAdmin/KelolaDivisi/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';


import { DivisionHeader } from './division-tabs/DivisionHeader';
import { DivisionOverview } from './division-tabs/DivisionOverview';
import { DivisionStaffTable } from './division-tabs/DivisionStaffTable';
import { DivisionVacancySection } from './division-tabs/DivisionVacancySection';
import { getActiveDivisionJobs } from './division-tabs/utils';

type DivisionTabsProps = {
    divisions: DivisionRecord[];
    activeDivisionId: string;
    onTabChange: (value: string) => void;
    onEditDivision: (division: DivisionRecord) => void;
    onOpenJobDialog: (division: DivisionRecord, job?: DivisionJob) => void;
    onReopenJob: (division: DivisionRecord, job: DivisionJob) => void;
    onCloseJob: (division: DivisionRecord, jobId?: number) => void;
    onSubmitApproval: (division: DivisionRecord, job: DivisionJob) => void;
    onPublishJob: (division: DivisionRecord, job: DivisionJob) => void;
    onApproveJob: (division: DivisionRecord, job: DivisionJob) => void;
    onRejectJob: (division: DivisionRecord, job: DivisionJob, note: string) => void;
    onDeleteDivision: (division: DivisionRecord) => void;
    deletingDivisionId: number | null;
};

export function DivisionTabs({
    divisions,
    activeDivisionId,
    onTabChange,
    onEditDivision,
    onOpenJobDialog,
    onReopenJob,
    onCloseJob,
    onSubmitApproval,
    onPublishJob,
    onApproveJob,
    onRejectJob,
    onDeleteDivision,
    deletingDivisionId,
}: DivisionTabsProps) {
    return (
        <Tabs value={activeDivisionId} onValueChange={onTabChange}>
            <div className="w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="h-auto min-w-max justify-start gap-2 rounded-none bg-transparent p-0">
                    {divisions.map((division) => {
                        const activeJobs = getActiveDivisionJobs(division);
                        const isHiringActive = activeJobs.length > 0;
                        const isUnpublishedWorkflow = Boolean(division.permissions?.can_edit_drafts) && activeJobs.some(
                            (job) =>
                                job.workflow_status !== 'published' &&
                                job.workflow_status !== 'pending_approval' &&
                                job.workflow_status !== 'closed',
                        );
                        const isPendingApproval = activeJobs.some(
                            (job) => job.workflow_status === 'pending_approval',
                        );
                        const isHiringButFull = isHiringActive && division.available_slots <= 0;
                        const triggerClass = isPendingApproval
                            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 data-[state=active]:bg-amber-200 data-[state=active]:text-amber-950 data-[state=active]:border-amber-300'
                            : isHiringButFull
                            ? 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 data-[state=active]:bg-red-200 data-[state=active]:text-red-900 data-[state=active]:border-red-300'
                            : isHiringActive
                                ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 data-[state=active]:bg-green-200 data-[state=active]:text-green-900 data-[state=active]:border-green-300'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:border-blue-900';

                        return (
                            <TabsTrigger
                                key={division.id}
                                value={division.id.toString()}
                                className={`h-auto flex-none rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all ${triggerClass}`}
                            >
                                <div className="flex items-center gap-2">
                                    {isPendingApproval && (
                                        <span
                                            className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                                            aria-label="Butuh approval"
                                        />
                                    )}
                                    {!isPendingApproval && isUnpublishedWorkflow && (
                                        <span
                                            className="h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white"
                                            aria-label="Belum dipublish"
                                        />
                                    )}
                                    <Building2 className="h-4 w-4" />
                                    <span>{division.name}</span>
                                </div>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-800">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Hijau: Lowongan aktif, slot masih tersedia
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Kuning: Lowongan sedang proses approval, menunggu persetujuan
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-800">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    Titik biru: Ada lowongan workflow yang belum dipublish
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-800">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    Merah: Lowongan aktif, kapasitas penuh
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Putih: Tidak ada lowongan aktif
                </span>
            </div>

            {divisions.map((division) => {
                const activeJobs = getActiveDivisionJobs(division);

                return (
                    <TabsContent key={division.id} value={division.id.toString()} className="space-y-6 pt-6">
                        <DivisionHeader
                            division={division}
                            activeJobsCount={activeJobs.length}
                            onEdit={() => onEditDivision(division)}
                            onDelete={() => onDeleteDivision(division)}
                            isDeleting={deletingDivisionId === division.id}
                            canManage={division.permissions?.can_edit_drafts}
                        />
                        <DivisionOverview division={division} hasActiveJobs={activeJobs.length > 0} />
                        <DivisionStaffTable staff={division.staff} />
                        <DivisionVacancySection
                            division={division}
                            onOpenJob={onOpenJobDialog}
                            onReopenJob={onReopenJob}
                            onCloseJob={onCloseJob}
                            onSubmitApproval={onSubmitApproval}
                            onPublishJob={onPublishJob}
                            onApproveJob={onApproveJob}
                            onRejectJob={onRejectJob}
                        />
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}
