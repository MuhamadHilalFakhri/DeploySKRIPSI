package superadmin

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestVacancyWorkflowRequestFromRequest_BindsJSONBody(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(
		http.MethodPost,
		"/super-admin/kelola-divisi/1/submit-job-approval",
		strings.NewReader(`{"job_id":12,"rejection_note":" perlu revisi "}`),
	)
	ctx.Request.Header.Set("Content-Type", "application/json")

	req := vacancyWorkflowRequestFromRequest(ctx)

	if req.JobID == nil || *req.JobID != 12 {
		t.Fatalf("expected job_id=12 from JSON body, got %#v", req.JobID)
	}
	if req.RejectionNote != "perlu revisi" {
		t.Fatalf("expected trimmed rejection_note from JSON body, got %q", req.RejectionNote)
	}
}

func TestVacancyWorkflowRequestFromRequest_FallsBackToQueryAndForm(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(
		http.MethodPost,
		"/super-admin/kelola-divisi/1/reject-job?job_id=21",
		strings.NewReader("rejection_note=butuh+perbaikan"),
	)
	ctx.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	req := vacancyWorkflowRequestFromRequest(ctx)

	if req.JobID == nil || *req.JobID != 21 {
		t.Fatalf("expected job_id=21 from query string, got %#v", req.JobID)
	}
	if req.RejectionNote != "butuh perbaikan" {
		t.Fatalf("expected rejection_note from form body, got %q", req.RejectionNote)
	}
}

func TestVacancyJobIDFromRequest_ReadsJSONBody(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(
		http.MethodPost,
		"/super-admin/kelola-divisi/1/publish-job",
		strings.NewReader(`{"job_id":33}`),
	)
	ctx.Request.Header.Set("Content-Type", "application/json")

	jobID := vacancyJobIDFromRequest(ctx)

	if jobID == nil || *jobID != 33 {
		t.Fatalf("expected job_id=33 from JSON body, got %#v", jobID)
	}
}
