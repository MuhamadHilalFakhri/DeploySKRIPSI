ALTER TABLE division_jobs
  ADD COLUMN workflow_status VARCHAR(32) NOT NULL DEFAULT 'draft' AFTER job_work_mode,
  ADD COLUMN submitted_by INT UNSIGNED NULL AFTER workflow_status,
  ADD COLUMN submitted_at TIMESTAMP NULL AFTER submitted_by,
  ADD COLUMN approved_by INT UNSIGNED NULL AFTER submitted_at,
  ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
  ADD COLUMN rejected_by INT UNSIGNED NULL AFTER approved_at,
  ADD COLUMN rejected_at TIMESTAMP NULL AFTER rejected_by,
  ADD COLUMN rejection_note TEXT NULL AFTER rejected_at,
  ADD COLUMN published_by INT UNSIGNED NULL AFTER rejection_note,
  ADD COLUMN published_at TIMESTAMP NULL AFTER published_by,
  ADD INDEX division_jobs_workflow_status_idx (workflow_status),
  ADD CONSTRAINT division_jobs_submitted_by_foreign
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT division_jobs_approved_by_foreign
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT division_jobs_rejected_by_foreign
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT division_jobs_published_by_foreign
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL;

UPDATE division_jobs
SET workflow_status = CASE
  WHEN is_active = 1 THEN 'published'
  ELSE 'closed'
END,
published_at = CASE
  WHEN is_active = 1 THEN COALESCE(opened_at, created_at, updated_at)
  ELSE published_at
END;
