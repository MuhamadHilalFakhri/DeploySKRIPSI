package organizationmodel

import (
	modeltypes "hris-backend/internal/models/types"
	"time"
)

type DivisionJob struct {
	ID                int64           `db:"id" json:"id"`
	DivisionProfileID int64           `db:"division_profile_id" json:"division_profile_id"`
	JobTitle          string          `db:"job_title" json:"job_title"`
	JobDescription    string          `db:"job_description" json:"job_description"`
	JobRequirements   modeltypes.JSON `db:"job_requirements" json:"job_requirements"`
	JobEligibility    modeltypes.JSON `db:"job_eligibility_criteria" json:"job_eligibility_criteria"`
	JobSalaryMin      *int            `db:"job_salary_min" json:"job_salary_min"`
	JobWorkMode       *string         `db:"job_work_mode" json:"job_work_mode"`
	WorkflowStatus    string          `db:"workflow_status" json:"workflow_status"`
	SubmittedBy       *int64          `db:"submitted_by" json:"submitted_by"`
	SubmittedAt       *time.Time      `db:"submitted_at" json:"submitted_at"`
	ApprovedBy        *int64          `db:"approved_by" json:"approved_by"`
	ApprovedAt        *time.Time      `db:"approved_at" json:"approved_at"`
	RejectedBy        *int64          `db:"rejected_by" json:"rejected_by"`
	RejectedAt        *time.Time      `db:"rejected_at" json:"rejected_at"`
	RejectionNote     *string         `db:"rejection_note" json:"rejection_note"`
	PublishedBy       *int64          `db:"published_by" json:"published_by"`
	PublishedAt       *time.Time      `db:"published_at" json:"published_at"`
	IsActive          bool            `db:"is_active" json:"is_active"`
	OpenedAt          *time.Time      `db:"opened_at" json:"opened_at"`
	ClosedAt          *time.Time      `db:"closed_at" json:"closed_at"`
	CreatedAt         *time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt         *time.Time      `db:"updated_at" json:"updated_at"`
}
