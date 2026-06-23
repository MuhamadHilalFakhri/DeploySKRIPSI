package authmodel

import "testing"

func TestCanApproveVacancyWorkflow_OnlyManagerHC(t *testing.T) {
	t.Parallel()

	if (User{Role: RoleSuperAdmin}).CanApproveVacancyWorkflow() {
		t.Fatal("super admin should not be able to approve vacancy workflow")
	}

	if !(User{Role: RoleManagerHC}).CanApproveVacancyWorkflow() {
		t.Fatal("manager hc should be able to approve vacancy workflow")
	}
}
