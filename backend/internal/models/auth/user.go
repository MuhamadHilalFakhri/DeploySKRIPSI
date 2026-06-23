package authmodel

import "time"

type User struct {
	ID              int64      `db:"id" json:"id"`
	EmployeeCode    *string    `db:"employee_code" json:"employee_code"`
	Name            string     `db:"name" json:"name"`
	Email           string     `db:"email" json:"email"`
	Role            string     `db:"role" json:"role"`
	Division        *string    `db:"division" json:"division"`
	Status          string     `db:"status" json:"status"`
	RegisteredAt    *time.Time `db:"registered_at" json:"registered_at"`
	InactiveAt      *time.Time `db:"inactive_at" json:"inactive_at"`
	LastLoginAt     *time.Time `db:"last_login_at" json:"last_login_at"`
	EmailVerifiedAt *time.Time `db:"email_verified_at" json:"email_verified_at"`
	PasswordHash    string     `db:"password" json:"-"`
	RememberToken   *string    `db:"remember_token" json:"-"`
	CreatedAt       *time.Time `db:"created_at" json:"created_at"`
	UpdatedAt       *time.Time `db:"updated_at" json:"updated_at"`
}

const (
	RoleSuperAdmin = "Super Admin"
	RoleManagerHC  = "Manager HC"
	RoleAdmin      = "Admin"
	RoleStaff      = "Staff"
	RolePelamar    = "Pelamar"
)

var UserRoles = []string{RoleSuperAdmin, RoleManagerHC, RoleAdmin, RoleStaff, RolePelamar}
var AssignableUserRoles = UserRoles

var UserStatuses = []string{"Active", "Inactive"}

func (u User) IsManagerHC() bool {
	return u.Role == RoleManagerHC
}

func (u User) CanAccessHumanCapitalOperations() bool {
	return u.Role == RoleSuperAdmin
}

func (u User) CanAccessVacancyWorkflow() bool {
	return u.Role == RoleSuperAdmin || u.IsManagerHC()
}

func (u User) CanEditVacancyDrafts() bool {
	return u.Role == RoleSuperAdmin
}

func (u User) CanApproveVacancyWorkflow() bool {
	return u.IsManagerHC()
}

func (u User) CanPublishApprovedVacancies() bool {
	return u.Role == RoleSuperAdmin
}
