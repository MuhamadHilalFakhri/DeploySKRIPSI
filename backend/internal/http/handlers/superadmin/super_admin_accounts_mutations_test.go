package superadmin

import (
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestValidateAccountInput_RejectsRegisteredAtBeforePreviousDate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	fieldErrors, err := validateAccountInput(
		ctx,
		nil,
		[]string{"Super Admin", "Manager HC", "Admin", "Staff", "Pelamar"},
		"Super Admin",
		"",
		"Super Admin",
		"superadmin@example.com",
		"Active",
		"2026-05-10",
		"2026-05-11",
		"",
		"_skip_password_",
		"_skip_password_",
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if got := fieldErrors["registered_at"]; got == "" {
		t.Fatal("expected registered_at validation error")
	}
}

func TestValidateAccountInput_AllowsRegisteredAtSameOrAfterPreviousDate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	fieldErrors, err := validateAccountInput(
		ctx,
		nil,
		[]string{"Super Admin", "Manager HC", "Admin", "Staff", "Pelamar"},
		"Super Admin",
		"",
		"Super Admin",
		"superadmin@example.com",
		"Active",
		"2026-05-11",
		"2026-05-11",
		"",
		"_skip_password_",
		"_skip_password_",
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if got := fieldErrors["registered_at"]; got != "" {
		t.Fatalf("expected no registered_at validation error, got %q", got)
	}
}

func TestValidateAccountInput_RejectsInactiveAtBeforeRegisteredAt(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	fieldErrors, err := validateAccountInput(
		ctx,
		nil,
		[]string{"Super Admin", "Manager HC", "Admin", "Staff", "Pelamar"},
		"Manager HC",
		"",
		"Manager HC",
		"managerhc@example.com",
		"Inactive",
		"2026-05-11",
		"",
		"2026-05-10",
		"_skip_password_",
		"_skip_password_",
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if got := fieldErrors["inactive_at"]; got == "" {
		t.Fatal("expected inactive_at validation error")
	}
}

func TestValidateAccountInput_RejectsInactiveDateForActiveAccount(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	fieldErrors, err := validateAccountInput(
		ctx,
		nil,
		[]string{"Super Admin", "Manager HC", "Admin", "Staff", "Pelamar"},
		"Super Admin",
		"",
		"Super Admin",
		"superadmin@example.com",
		"Active",
		"2026-05-11",
		"",
		"2026-05-12",
		"_skip_password_",
		"_skip_password_",
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if got := fieldErrors["inactive_at"]; got == "" {
		t.Fatal("expected inactive_at validation error")
	}
}
