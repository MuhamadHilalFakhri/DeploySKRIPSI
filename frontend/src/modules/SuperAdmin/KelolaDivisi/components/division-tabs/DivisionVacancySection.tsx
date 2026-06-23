import {
    AlertCircle,
    Banknote,
    Briefcase,
    CheckCheck,
    CheckCircle2,
    Eye,
    Edit,
    MapPinned,
    RotateCcw,
    Send,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import type {
    DivisionJob,
    DivisionRecord,
} from '@/modules/SuperAdmin/KelolaDivisi/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';

import { getActiveDivisionJobs, getInactiveDivisionJobs } from './utils';

type DivisionVacancySectionProps = {
    division: DivisionRecord;
    onOpenJob: (division: DivisionRecord, job?: DivisionJob) => void;
    onReopenJob: (division: DivisionRecord, job: DivisionJob) => void;
    onCloseJob: (division: DivisionRecord, jobId?: number) => void;
    onSubmitApproval: (division: DivisionRecord, job: DivisionJob) => void;
    onPublishJob: (division: DivisionRecord, job: DivisionJob) => void;
    onApproveJob: (division: DivisionRecord, job: DivisionJob) => void;
    onRejectJob: (division: DivisionRecord, job: DivisionJob, note: string) => void;
};

type VacancyCardProps = {
    division: DivisionRecord;
    job: DivisionJob;
    onEdit: () => void;
    onViewDetail: () => void;
    onClose: () => void;
    onSubmitApproval: () => void;
    onPublish: () => void;
    onApprove: () => void;
    onReject: (note: string) => void;
};

type ClosedVacancyCardProps = {
    division: DivisionRecord;
    job: DivisionJob;
    onViewDetail: () => void;
    onReopen: () => void;
};

function formatRupiah(value?: number | null) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return null;
    }
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function workflowLabel(status?: string) {
    switch (status) {
        case 'draft':
            return 'Draft';
        case 'pending_approval':
            return 'Menunggu Approval';
        case 'approved':
            return 'Approved';
        case 'published':
            return 'Published';
        case 'rejected':
            return 'Rejected';
        case 'closed':
            return 'Ditutup';
        default:
            return status ?? 'Tidak diketahui';
    }
}

function workflowBadgeClass(status?: string) {
    switch (status) {
        case 'draft':
            return 'border-slate-300 bg-slate-50 text-slate-700';
        case 'pending_approval':
            return 'border-amber-300 bg-amber-50 text-amber-700';
        case 'approved':
            return 'border-blue-300 bg-blue-50 text-blue-700';
        case 'published':
            return 'border-emerald-300 bg-emerald-50 text-emerald-700';
        case 'rejected':
            return 'border-red-300 bg-red-50 text-red-700';
        default:
            return 'border-slate-300 bg-slate-50 text-slate-700';
    }
}

function formatDateTime(value?: string | null) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function DetailInfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </span>
            <span className="text-sm text-slate-800">{value}</span>
        </div>
    );
}

function VacancyDetailDialog({
    division,
    job,
    open,
    onOpenChange,
}: {
    division: DivisionRecord;
    job: DivisionJob | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const criteria = job?.job_eligibility_criteria ?? {};
    const scoringWeights = criteria.scoring_weights;
    const cleanRequirements = (job?.job_requirements ?? []).filter(
        (requirement) => requirement && requirement.trim() !== '',
    );
    const cleanPrograms = Array.isArray(criteria.program_studies)
        ? criteria.program_studies.filter((item) => item && item.trim() !== '')
        : [];
    const salaryLabel = formatRupiah(job?.job_salary_min);
    const detailRows = [
        salaryLabel ? { label: 'Gaji Minimum', value: salaryLabel } : null,
        job?.job_work_mode ? { label: 'Mode Kerja', value: job.job_work_mode } : null,
        job?.workflow_status ? { label: 'Status Workflow', value: workflowLabel(job.workflow_status) } : null,
        job?.opened_at ? { label: 'Dibuka', value: formatDateTime(job.opened_at) ?? '-' } : null,
        job?.submitted_at ? { label: 'Diajukan Approval', value: formatDateTime(job.submitted_at) ?? '-' } : null,
        job?.approved_at ? { label: 'Disetujui', value: formatDateTime(job.approved_at) ?? '-' } : null,
        job?.published_at ? { label: 'Dipublikasikan', value: formatDateTime(job.published_at) ?? '-' } : null,
        job?.closed_at ? { label: 'Ditutup', value: formatDateTime(job.closed_at) ?? '-' } : null,
    ].filter((item): item is { label: string; value: string } => Boolean(item?.value));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-[96vw] flex-col overflow-hidden border-0 bg-white p-0 sm:w-full sm:max-w-3xl">
                <DialogHeader className="shrink-0 space-y-2 border-b border-slate-100 px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={workflowBadgeClass(job?.workflow_status)}>
                            {workflowLabel(job?.workflow_status)}
                        </Badge>
                        <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                            Divisi: {division.name}
                        </Badge>
                    </div>
                    <DialogTitle className="text-left text-xl text-slate-900">
                        {job?.job_title ?? 'Detail Lowongan'}
                    </DialogTitle>
                    <DialogDescription className="text-left text-sm text-slate-600">
                        Tinjau detail lengkap lowongan kerja pada divisi ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6">
                    <section className="space-y-2">
                        <h6 className="text-sm font-semibold text-slate-900">Deskripsi Pekerjaan</h6>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                            {job?.job_description || 'Belum ada deskripsi pekerjaan.'}
                        </div>
                    </section>

                    {detailRows.length > 0 && (
                        <section className="space-y-2">
                            <h6 className="text-sm font-semibold text-slate-900">Informasi Utama</h6>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {detailRows.map((item) => (
                                    <DetailInfoRow key={item.label} label={item.label} value={item.value} />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="space-y-2">
                        <h6 className="text-sm font-semibold text-slate-900">Persyaratan</h6>
                        {cleanRequirements.length > 0 ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <ul className="space-y-2 text-sm text-slate-700">
                                    {cleanRequirements.map((requirement, index) => (
                                        <li key={`${job?.id ?? 'detail'}-detail-req-${index}`} className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                            <span>{requirement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                Belum ada persyaratan yang diisi.
                            </div>
                        )}
                    </section>

                    <section className="space-y-2">
                        <h6 className="text-sm font-semibold text-slate-900">Kriteria Kelayakan</h6>
                        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
                            {criteria.min_education && (
                                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                                    Minimal Pendidikan: {criteria.min_education}
                                </Badge>
                            )}
                            {cleanPrograms.map((program) => (
                                <Badge key={`${job?.id ?? 'detail'}-${program}`} variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                                    Prodi: {program}
                                </Badge>
                            ))}
                            {(criteria.min_experience_years ?? 0) > 0 && (
                                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                                    Minimal Pengalaman: {criteria.min_experience_years} tahun
                                </Badge>
                            )}
                            {(criteria.min_age ?? 0) > 0 && (
                                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                                    Umur Minimal: {criteria.min_age}
                                </Badge>
                            )}
                            {(criteria.max_age ?? 0) > 0 && (
                                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                                    Umur Maksimal: {criteria.max_age}
                                </Badge>
                            )}
                            {criteria.gender && (
                                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                                    Gender: {criteria.gender}
                                </Badge>
                            )}
                            {!criteria.min_education &&
                                cleanPrograms.length === 0 &&
                                (criteria.min_experience_years ?? 0) <= 0 &&
                                (criteria.min_age ?? 0) <= 0 &&
                                (criteria.max_age ?? 0) <= 0 &&
                                !criteria.gender && (
                                    <span className="text-sm text-slate-500">Belum ada kriteria kelayakan tambahan.</span>
                                )}
                        </div>
                    </section>

                    {scoringWeights && (
                        <section className="space-y-2">
                            <h6 className="text-sm font-semibold text-slate-900">Pengaturan Scoring</h6>
                            <div className="grid gap-3">
                                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                    <p className="text-sm font-semibold text-indigo-900">Bobot Penilaian</p>
                                    <div className="mt-3 grid gap-2 text-sm text-indigo-900">
                                        {scoringWeights.education != null && <DetailInfoRow label="Education" value={`${scoringWeights.education}%`} />}
                                        {scoringWeights.experience != null && <DetailInfoRow label="Experience" value={`${scoringWeights.experience}%`} />}
                                        {scoringWeights.skills != null && <DetailInfoRow label="Skills" value={`${scoringWeights.skills}%`} />}
                                        {scoringWeights.certification != null && <DetailInfoRow label="Certification" value={`${scoringWeights.certification}%`} />}
                                        {scoringWeights.profile != null && <DetailInfoRow label="Profile" value={`${scoringWeights.profile}%`} />}
                                        {scoringWeights.ai_screening != null && <DetailInfoRow label="AI Screening" value={`${scoringWeights.ai_screening}%`} />}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {job?.rejection_note && (
                        <section className="space-y-2">
                            <h6 className="text-sm font-semibold text-slate-900">Catatan Penolakan</h6>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {job.rejection_note}
                            </div>
                        </section>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function VacancyCard({
    division,
    job,
    onEdit,
    onViewDetail,
    onClose,
    onSubmitApproval,
    onPublish,
    onApprove,
    onReject,
}: VacancyCardProps) {
    const [isApproveAlertOpen, setIsApproveAlertOpen] = useState(false);
    const [isCloseAlertOpen, setIsCloseAlertOpen] = useState(false);
    const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
    const [approveConfirmed, setApproveConfirmed] = useState(false);
    const [rejectConfirmed, setRejectConfirmed] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');

    const criteria: NonNullable<DivisionJob['job_eligibility_criteria']> =
        job.job_eligibility_criteria ?? {};
    const scoringWeights = criteria.scoring_weights;
    const cleanRequirements = (job.job_requirements ?? []).filter(
        (requirement) => requirement && requirement.trim() !== '',
    );
    const cleanPrograms = Array.isArray(criteria.program_studies)
        ? criteria.program_studies.filter((item) => item && item.trim() !== '')
        : [];
    const salaryLabel = formatRupiah(job.job_salary_min);
    const workflowStatus = job.workflow_status ?? 'draft';
    const permissions = division.permissions ?? {};
    const hasCustomScoring = Boolean(
        scoringWeights &&
            (
                scoringWeights.education != null ||
                scoringWeights.experience != null ||
                scoringWeights.certification != null ||
                scoringWeights.profile != null ||
                scoringWeights.ai_screening != null
            ),
    );

    const canEdit = Boolean(permissions.can_edit_drafts);
    const canViewDetail = Boolean(permissions.manager_view_only);
    const canSubmit = Boolean(permissions.can_submit) && (
        workflowStatus === 'draft' || workflowStatus === 'rejected'
    );
    const canPublish = Boolean(permissions.can_publish) && workflowStatus === 'approved';
    const canApprove = Boolean(permissions.can_approve) && workflowStatus === 'pending_approval';
    const canReject = Boolean(permissions.can_reject) && workflowStatus === 'pending_approval';
    const canClose = Boolean(permissions.can_close) && workflowStatus === 'published';
    const trimmedRejectionNote = rejectionNote.trim();
    const isRejectActionReady = rejectConfirmed && trimmedRejectionNote.length >= 10;

    return (
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={workflowBadgeClass(workflowStatus)}>
                            {workflowLabel(workflowStatus)}
                        </Badge>
                    </div>
                    <h5 className="text-base font-semibold text-emerald-900 md:text-lg">
                        {job.job_title ?? 'Lowongan tanpa judul'}
                    </h5>
                    <p className="text-xs text-slate-700 md:text-sm">
                        {job.job_description || 'Belum ada deskripsi pekerjaan.'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                        {salaryLabel && (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                                {salaryLabel}
                            </span>
                        )}
                        {job.job_work_mode && (
                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-800">
                                <MapPinned className="mr-1.5 h-3.5 w-3.5" />
                                {job.job_work_mode}
                            </span>
                        )}
                    </div>

                    {cleanRequirements.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-slate-700 md:mt-3 md:text-sm">
                            {cleanRequirements.map((requirement, index) => (
                                <li
                                    key={`${job.id ?? 'legacy'}-req-${index}`}
                                    className="flex items-start gap-2"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                    <span>{requirement}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                        {criteria.min_education && (
                            <Badge variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                                Min Edu: {criteria.min_education}
                            </Badge>
                        )}
                        {cleanPrograms.slice(0, 3).map((program) => (
                            <Badge key={`${job.id ?? 'legacy'}-${program}`} variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                                Prodi: {program}
                            </Badge>
                        ))}
                        {cleanPrograms.length > 3 && (
                            <Badge variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                                +{cleanPrograms.length - 3} prodi lain
                            </Badge>
                        )}
                        {(criteria.min_experience_years ?? 0) > 0 && (
                            <Badge variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                                Min Exp: {criteria.min_experience_years} th
                            </Badge>
                        )}
                        {(criteria.min_age ?? 0) > 0 && (
                            <Badge variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                                Umur Min: {criteria.min_age}
                            </Badge>
                        )}
                        {(criteria.max_age ?? 0) > 0 && (
                            <Badge variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                                Umur Max: {criteria.max_age}
                            </Badge>
                        )}
                        {hasCustomScoring && (
                            <Badge variant="outline" className="border-indigo-300 bg-white text-indigo-700">
                                Custom Scoring Aktif
                            </Badge>
                        )}
                    </div>

                    {workflowStatus === 'rejected' && job.rejection_note && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 md:text-sm">
                            <p className="font-semibold">Catatan penolakan</p>
                            <p className="mt-1">{job.rejection_note}</p>
                        </div>
                    )}
                </div>

                <div className="w-full shrink-0 lg:max-w-[250px]">
                    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Aksi Lowongan
                        </p>
                        {(canApprove || canReject) && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                Periksa detail lowongan terlebih dahulu, lalu pilih keputusan approval.
                            </div>
                        )}
                    {canViewDetail && (
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={onViewDetail}>
                            <Eye className="mr-2 h-4 w-4 text-slate-600" />
                            Detail
                        </Button>
                    )}
                    {canEdit && (
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={onEdit}>
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            Edit
                        </Button>
                    )}
                    {canSubmit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={onSubmitApproval}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Submit Approval
                        </Button>
                    )}
                    {canApprove && (
                        <AlertDialog
                            open={isApproveAlertOpen}
                            onOpenChange={(open) => {
                                setIsApproveAlertOpen(open);
                                if (!open) {
                                    setApproveConfirmed(false);
                                }
                            }}
                        >
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    <CheckCheck className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Setujui Lowongan Ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Pastikan detail lowongan sudah diperiksa sebelum approval dikirim.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                                        <p className="font-semibold">{job.job_title ?? 'Lowongan tanpa judul'}</p>
                                        <p className="mt-1 text-xs text-blue-800">
                                            {job.job_description || 'Belum ada deskripsi pekerjaan.'}
                                        </p>
                                    </div>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
                                        <Checkbox
                                            checked={approveConfirmed}
                                            onCheckedChange={(checked) => setApproveConfirmed(checked === true)}
                                            className="mt-0.5"
                                        />
                                        <span className="text-sm text-slate-700">
                                            Saya sudah memeriksa detail lowongan dan yakin untuk menyetujuinya.
                                        </span>
                                    </label>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        disabled={!approveConfirmed}
                                        onClick={() => {
                                            if (!approveConfirmed) {
                                                return;
                                            }
                                            onApprove();
                                            setApproveConfirmed(false);
                                        }}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Konfirmasi Approve
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {canReject && (
                        <AlertDialog
                            open={isRejectAlertOpen}
                            onOpenChange={(open) => {
                                setIsRejectAlertOpen(open);
                                if (!open) {
                                    setRejectConfirmed(false);
                                    setRejectionNote('');
                                }
                            }}
                        >
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tolak Lowongan?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Sertakan catatan revisi untuk Super Admin.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <textarea
                                        value={rejectionNote}
                                        onChange={(event) => setRejectionNote(event.target.value)}
                                        className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        placeholder="Tuliskan alasan penolakan atau revisi yang dibutuhkan."
                                    />
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={trimmedRejectionNote.length >= 10 ? 'text-emerald-600' : 'text-amber-600'}>
                                            Minimal 10 karakter agar alasan penolakan jelas.
                                        </span>
                                        <span className="text-slate-500">
                                            {trimmedRejectionNote.length}/10+
                                        </span>
                                    </div>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
                                        <Checkbox
                                            checked={rejectConfirmed}
                                            onCheckedChange={(checked) => setRejectConfirmed(checked === true)}
                                            className="mt-0.5"
                                        />
                                        <span className="text-sm text-slate-700">
                                            Saya yakin menolak lowongan ini dan catatan revisi sudah sesuai.
                                        </span>
                                    </label>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        disabled={!isRejectActionReady}
                                        onClick={() => {
                                            if (!isRejectActionReady) {
                                                return;
                                            }
                                            onReject(trimmedRejectionNote);
                                            setRejectConfirmed(false);
                                            setRejectionNote('');
                                        }}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Konfirmasi Tolak
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {canPublish && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={onPublish}
                        >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Publish
                        </Button>
                    )}
                    {canClose && (
                        <AlertDialog open={isCloseAlertOpen} onOpenChange={setIsCloseAlertOpen}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => setIsCloseAlertOpen(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Tutup Lowongan
                            </Button>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tutup Lowongan?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Lowongan akan ditutup dan tidak lagi muncul pada portal pelamar.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onClose}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Tutup Lowongan
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    </div>
                </div>
            </div>

            {division.available_slots <= 0 && (
                <p className="mt-3 text-xs text-red-600">
                    Kapasitas divisi penuh. Pertimbangkan menambah kapasitas untuk mempercepat
                    pemenuhan posisi.
                </p>
            )}
        </div>
    );
}

function ClosedVacancyCard({ division, job, onViewDetail, onReopen }: ClosedVacancyCardProps) {
    const cleanRequirements = (job.job_requirements ?? []).filter(
        (requirement) => requirement && requirement.trim() !== '',
    );
    const salaryLabel = formatRupiah(job.job_salary_min);
    const canViewDetail = Boolean(division.permissions?.manager_view_only);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                            Ditutup
                        </Badge>
                    </div>
                    <h5 className="text-base font-semibold text-slate-900 md:text-lg">
                        {job.job_title ?? 'Lowongan tanpa judul'}
                    </h5>
                    <p className="text-xs text-slate-700 md:text-sm">
                        {job.job_description || 'Belum ada deskripsi pekerjaan.'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                        {salaryLabel && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                                {salaryLabel}
                            </span>
                        )}
                        {job.job_work_mode && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                                <MapPinned className="mr-1.5 h-3.5 w-3.5" />
                                {job.job_work_mode}
                            </span>
                        )}
                    </div>

                    {cleanRequirements.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-slate-700 md:mt-3 md:text-sm">
                            {cleanRequirements.slice(0, 3).map((requirement, index) => (
                                <li
                                    key={`${job.id ?? 'closed'}-req-${index}`}
                                    className="flex items-start gap-2"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-500" />
                                    <span>{requirement}</span>
                                </li>
                            ))}
                            {cleanRequirements.length > 3 && (
                                <li className="text-xs text-slate-500">+{cleanRequirements.length - 3} persyaratan lain</li>
                            )}
                        </ul>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    {canViewDetail && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={onViewDetail}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Detail
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={onReopen}
                        disabled={division.available_slots === 0 || !division.permissions?.can_reopen}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Pulihkan Draft
                    </Button>
                </div>
            </div>
            {division.available_slots <= 0 && (
                <p className="mt-3 text-xs text-red-600">
                    Kapasitas divisi penuh. Tingkatkan kapasitas sebelum membuka kembali lowongan.
                </p>
            )}
        </div>
    );
}

export function DivisionVacancySection({
    division,
    onOpenJob,
    onReopenJob,
    onCloseJob,
    onSubmitApproval,
    onPublishJob,
    onApproveJob,
    onRejectJob,
}: DivisionVacancySectionProps) {
    const activeJobs = getActiveDivisionJobs(division);
    const closedJobs = getInactiveDivisionJobs(division);
    const [isCloseAllAlertOpen, setIsCloseAllAlertOpen] = useState(false);
    const [detailJob, setDetailJob] = useState<DivisionJob | null>(null);

    if (activeJobs.length > 0) {
        return (
            <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-3 md:space-y-4 md:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h4 className="text-base font-semibold text-green-900 md:text-lg">
                            Workflow Lowongan ({activeJobs.length})
                        </h4>
                        <p className="text-xs text-slate-700 md:text-sm">
                            Draft, approval, publish, dan penutupan lowongan dikelola per item.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {division.permissions?.can_close && (
                            <AlertDialog open={isCloseAllAlertOpen} onOpenChange={setIsCloseAllAlertOpen}>
                                <Button
                                    variant="outline"
                                    className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => setIsCloseAllAlertOpen(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Tutup Semua Published
                                </Button>
                                <AlertDialogContent className="bg-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Tutup Semua Lowongan?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Semua lowongan yang sudah published pada divisi ini akan ditutup.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onCloseJob(division)}
                                            className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Tutup Semua
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button
                            onClick={() => onOpenJob(division)}
                            disabled={division.available_slots === 0 || !division.permissions?.can_create_draft}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-60"
                        >
                            <Briefcase className="mr-2 h-4 w-4" />
                            Buat Draft Lowongan
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    {activeJobs.map((job, index) => (
                        <VacancyCard
                            key={job.id ?? `legacy-${division.id}-${index}`}
                            division={division}
                            job={job}
                            onEdit={() => onOpenJob(division, job)}
                            onViewDetail={() => setDetailJob(job)}
                            onClose={() => onCloseJob(division, job.id ?? undefined)}
                            onSubmitApproval={() => onSubmitApproval(division, job)}
                            onPublish={() => onPublishJob(division, job)}
                            onApprove={() => onApproveJob(division, job)}
                            onReject={(note) => onRejectJob(division, job, note)}
                        />
                    ))}
                </div>

                {division.available_slots === 0 && (
                    <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                        <AlertCircle className="mr-2 inline h-4 w-4" />
                        Kapasitas sudah penuh. Edit kapasitas divisi terlebih dahulu.
                    </div>
                )}

                {closedJobs.length > 0 && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:p-4">
                        <div>
                            <h5 className="text-sm font-semibold text-slate-900 md:text-base">
                                Lowongan Ditutup ({closedJobs.length})
                            </h5>
                            <p className="text-xs text-slate-600 md:text-sm">
                                Lowongan yang ditutup tidak dihapus dan bisa dipulihkan sebagai draft.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {closedJobs.map((job, index) => (
                                <ClosedVacancyCard
                                    key={job.id ?? `closed-${division.id}-${index}`}
                                    division={division}
                                    job={job}
                                    onViewDetail={() => setDetailJob(job)}
                                    onReopen={() => onReopenJob(division, job)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <VacancyDetailDialog
                    division={division}
                    job={detailJob}
                    open={detailJob !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailJob(null);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-dashed p-6 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-medium text-slate-900">Belum ada workflow lowongan aktif</p>
            <p className="mt-1 text-sm text-slate-600">
                {division.available_slots > 0
                    ? 'Anda dapat membuat draft lowongan baru.'
                    : 'Kapasitas penuh. Tingkatkan kapasitas untuk membuka lowongan.'}
            </p>
            <div className="mt-4 flex justify-center">
                <Button
                    onClick={() => onOpenJob(division)}
                    disabled={division.available_slots === 0 || !division.permissions?.can_create_draft}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60"
                >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Buat Draft Lowongan
                </Button>
            </div>
            {division.available_slots === 0 && (
                <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                    <AlertCircle className="mr-2 inline h-4 w-4" />
                    Kapasitas sudah penuh. Edit kapasitas divisi terlebih dahulu.
                </div>
            )}

            {closedJobs.length > 0 && (
                <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left md:p-4">
                    <div>
                        <h5 className="text-sm font-semibold text-slate-900 md:text-base">
                            Riwayat Lowongan Ditutup ({closedJobs.length})
                        </h5>
                        <p className="text-xs text-slate-600 md:text-sm">
                            Pilih lowongan untuk dipulihkan sebagai draft tanpa membuat data baru.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {closedJobs.map((job, index) => (
                            <ClosedVacancyCard
                                key={job.id ?? `closed-empty-${division.id}-${index}`}
                                division={division}
                                job={job}
                                onViewDetail={() => setDetailJob(job)}
                                onReopen={() => onReopenJob(division, job)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <VacancyDetailDialog
                division={division}
                job={detailJob}
                open={detailJob !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailJob(null);
                    }
                }}
            />
        </div>
    );
}
