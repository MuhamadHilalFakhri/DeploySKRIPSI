package superadmin

import (
	"testing"
	"time"
)

func TestValidateInterviewScheduleDateTime_RejectsPastTimeToday(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.May, 24, 15, 0, 0, 0, time.FixedZone("WIB", 7*60*60))
	errs := validateInterviewScheduleDateTime("2026-05-24", "14:30", "15:00", now)
	if errs["time"] == "" {
		t.Fatal("expected time validation error for past slot on the same day")
	}
}

func TestValidateInterviewScheduleDateTime_AllowsFutureTimeToday(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.May, 24, 15, 0, 0, 0, time.FixedZone("WIB", 7*60*60))
	errs := validateInterviewScheduleDateTime("2026-05-24", "15:30", "16:00", now)
	if len(errs) > 0 {
		t.Fatalf("expected no validation errors, got %v", errs)
	}
}
