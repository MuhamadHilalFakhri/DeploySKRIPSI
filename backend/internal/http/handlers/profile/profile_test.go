package profile

import (
	"testing"
	"time"

	"hris-backend/internal/http/handlers"
)

func TestParseStaffDate_RejectsToday(t *testing.T) {
	t.Parallel()

	today := handlers.StartOfDisplayDay(time.Now()).Format("2006-01-02")
	parsed, errMessage := parseStaffDate(today)
	if parsed != nil {
		t.Fatal("expected parsed date to be nil")
	}
	if errMessage == "" {
		t.Fatal("expected date_of_birth validation error for today")
	}
}
