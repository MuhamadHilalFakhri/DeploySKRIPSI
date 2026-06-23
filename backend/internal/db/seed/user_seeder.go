package seed

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"hris-backend/internal/models"
	"hris-backend/internal/services"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type seedUserAccount struct {
	Name     string
	Email    string
	Password string
	Role     string
	Division *string
}

func RunUserSeeder(database *sqlx.DB) error {
	if database == nil {
		return errors.New("database connection is nil")
	}

	humanCapital := "Human Capital"
	accounts := []seedUserAccount{
		{
			Name:     "Super Admin",
			Email:    "superadmin@admin.com",
			Password: "password",
			Role:     models.RoleSuperAdmin,
			Division: nil,
		},
		{
			Name:     "Manager HC",
			Email:    "managerhc@admin.com",
			Password: "password",
			Role:     models.RoleManagerHC,
			Division: &humanCapital,
		},
	}

	for _, account := range accounts {
		if err := upsertSeedUser(database, account); err != nil {
			return err
		}
	}

	if err := deleteLegacyAdminHCSeed(database); err != nil {
		return err
	}

	return nil
}

func upsertSeedUser(database *sqlx.DB, account seedUserAccount) error {
	var existing models.User
	existingErr := database.Get(&existing, "SELECT * FROM users WHERE email = ? LIMIT 1", account.Email)
	if existingErr != nil && !errors.Is(existingErr, sql.ErrNoRows) {
		return existingErr
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	now := time.Now()
	division := normalizeSeedDivision(account.Division)
	registeredAt := now.Format("2006-01-02")

	if existingErr == nil {
		if existing.Role != account.Role || strings.TrimSpace(ptrToString(existing.EmployeeCode)) == "" {
			_, genErr := services.WithGeneratedEmployeeCodeRetry(database, account.Role, func(code string) error {
				_, updateErr := database.Exec(
					`UPDATE users
					 SET employee_code = ?, name = ?, role = ?, division = ?, status = 'Active', password = ?, inactive_at = NULL, updated_at = ?, email_verified_at = ?
					 WHERE id = ?`,
					code,
					account.Name,
					account.Role,
					nullableDivision(division),
					string(hash),
					now,
					now,
					existing.ID,
				)
				return updateErr
			})
			if genErr != nil {
				return genErr
			}
			return nil
		}

		_, err = database.Exec(
			`UPDATE users
			 SET name = ?, role = ?, division = ?, status = 'Active', password = ?, inactive_at = NULL, updated_at = ?, email_verified_at = ?
			 WHERE id = ?`,
			account.Name,
			account.Role,
			nullableDivision(division),
			string(hash),
			now,
			now,
			existing.ID,
		)
		return err
	}

	_, err = services.WithGeneratedEmployeeCodeRetry(database, account.Role, func(code string) error {
		_, insertErr := database.Exec(
			`INSERT INTO users (employee_code, name, email, role, division, status, registered_at, email_verified_at, password, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?)`,
			code,
			account.Name,
			account.Email,
			account.Role,
			nullableDivision(division),
			registeredAt,
			now,
			string(hash),
			now,
			now,
		)
		return insertErr
	})
	return err
}

func normalizeSeedDivision(value *string) *string {
	if value == nil {
		return nil
	}
	clean := strings.TrimSpace(*value)
	if clean == "" {
		return nil
	}
	return &clean
}

func nullableDivision(value *string) any {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil
	}
	return *value
}

func ptrToString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func deleteLegacyAdminHCSeed(database *sqlx.DB) error {
	_, err := database.Exec(
		`DELETE FROM users
		 WHERE email = ?`,
		"adminhc@admin.com",
	)
	return err
}
