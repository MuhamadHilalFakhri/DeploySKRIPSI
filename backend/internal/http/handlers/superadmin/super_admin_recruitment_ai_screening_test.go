package superadmin

import (
	"testing"

	"hris-backend/internal/models"
)

func TestBuildEffectiveAIScreeningRowFallsBackToLatestSuccessContent(t *testing.T) {
	t.Parallel()

	latestStatus := "failed"
	latestError := "rate limit"
	successModel := "openai/gpt-oss-120b"
	successRecommendation := "Cocok Potensial"
	successSummary := "Kandidat relevan untuk backend."
	successScore := 82.5

	latestRow := &models.RecruitmentAIScreening{
		ID:            20,
		ApplicationID: 99,
		Status:        latestStatus,
		ErrorMessage:  &latestError,
	}
	successRow := &models.RecruitmentAIScreening{
		ID:             10,
		ApplicationID:  99,
		Status:         "success",
		ModelUsed:      &successModel,
		MatchScore:     &successScore,
		Recommendation: &successRecommendation,
		Summary:        &successSummary,
		StrengthsJSON:  []byte(`["Golang"]`),
		GapsJSON:       []byte(`["Testing"]`),
	}

	effective := buildEffectiveAIScreeningRow(latestRow, successRow)
	if effective == nil {
		t.Fatalf("expected effective row")
	}
	if effective.ID != latestRow.ID {
		t.Fatalf("expected latest row id to be preserved, got %d", effective.ID)
	}
	if effective.Status != latestStatus {
		t.Fatalf("expected status %q, got %q", latestStatus, effective.Status)
	}
	if effective.MatchScore == nil || *effective.MatchScore != successScore {
		t.Fatalf("expected success score %.1f to be reused, got %#v", successScore, effective.MatchScore)
	}
	if effective.Recommendation == nil || *effective.Recommendation != successRecommendation {
		t.Fatalf("expected success recommendation %q, got %#v", successRecommendation, effective.Recommendation)
	}
	if effective.Summary == nil || *effective.Summary != successSummary {
		t.Fatalf("expected success summary %q, got %#v", successSummary, effective.Summary)
	}
	if string(effective.StrengthsJSON) != `["Golang"]` {
		t.Fatalf("expected strengths to be reused, got %s", string(effective.StrengthsJSON))
	}
}

func TestBuildEffectiveAIScreeningRowReturnsLatestSuccessWhenStatusAlreadySuccess(t *testing.T) {
	t.Parallel()

	summary := "Ringkasan terbaru"
	latestRow := &models.RecruitmentAIScreening{
		ID:      33,
		Status:  "success",
		Summary: &summary,
	}

	effective := buildEffectiveAIScreeningRow(latestRow, nil)
	if effective == nil {
		t.Fatalf("expected effective row")
	}
	if effective.ID != latestRow.ID {
		t.Fatalf("expected latest row id %d, got %d", latestRow.ID, effective.ID)
	}
	if effective.Summary == nil || *effective.Summary != summary {
		t.Fatalf("expected summary %q, got %#v", summary, effective.Summary)
	}
}
