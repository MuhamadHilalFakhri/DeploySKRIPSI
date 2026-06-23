package superadmin

import (
	"hris-backend/internal/http/handlers"
	dbrepo "hris-backend/internal/repository"

	"net/http"
	"time"

	"hris-backend/internal/http/middleware"
	"hris-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func SuperAdminDashboard(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil || user.Role != models.RoleSuperAdmin {
		handlers.JSONError(c, http.StatusForbidden, "Forbidden")
		return
	}

	db := middleware.GetDB(c)

	roleCounts := map[string]int{}
	roleRows, _ := dbrepo.ListUserRoleCounts(db)
	for _, row := range roleRows {
		role := row.Role
		total := row.Total
		roleCounts[role] = total
	}

	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	countRegistered := func(role *string, start, end time.Time) int {
		count, _ := dbrepo.CountRegisteredUsersBetween(db, role, start, end)
		return count
	}

	stats := map[string]int{
		"totalUsers":  roleCounts[models.RoleSuperAdmin] + roleCounts[models.RoleManagerHC] + roleCounts[models.RoleAdmin] + roleCounts[models.RoleStaff] + roleCounts[models.RolePelamar],
		"superAdmins": roleCounts[models.RoleSuperAdmin],
		"managerHC":   roleCounts[models.RoleManagerHC],
		"admins":      roleCounts[models.RoleAdmin],
		"staff":       roleCounts[models.RoleStaff],
		"pelamar":     roleCounts[models.RolePelamar],
	}

	statChanges := map[string]int{
		"totalUsers":  countRegistered(nil, currentMonthStart, now),
		"superAdmins": countRegistered(ptr(models.RoleSuperAdmin), currentMonthStart, now),
		"managerHC":   countRegistered(ptr(models.RoleManagerHC), currentMonthStart, now),
		"admins":      countRegistered(ptr(models.RoleAdmin), currentMonthStart, now),
		"staff":       countRegistered(ptr(models.RoleStaff), currentMonthStart, now),
		"pelamar":     countRegistered(ptr(models.RolePelamar), currentMonthStart, now),
	}

	userDistribution := []map[string]any{
		{"name": models.RoleSuperAdmin, "value": roleCounts[models.RoleSuperAdmin], "color": "#7c3aed"},
		{"name": models.RoleManagerHC, "value": roleCounts[models.RoleManagerHC], "color": "#0ea5e9"},
		{"name": models.RoleAdmin, "value": roleCounts[models.RoleAdmin], "color": "#3b82f6"},
		{"name": models.RoleStaff, "value": roleCounts[models.RoleStaff], "color": "#10b981"},
		{"name": models.RolePelamar, "value": roleCounts[models.RolePelamar], "color": "#f97316"},
	}

	activeStatus := "Active"
	inactiveStatus := "Inactive"
	staffTotal, _ := dbrepo.CountUsersByRoleAndStatus(db, models.RoleStaff, nil)
	staffActive, _ := dbrepo.CountUsersByRoleAndStatus(db, models.RoleStaff, &activeStatus)
	staffInactive, _ := dbrepo.CountUsersByRoleAndStatus(db, models.RoleStaff, &inactiveStatus)

	staffStats := map[string]int{
		"total":    staffTotal,
		"active":   staffActive,
		"inactive": staffInactive,
	}

	religionCounts := map[string]int{}
	religionRows, _ := dbrepo.ListStaffReligionCounts(db)
	for _, row := range religionRows {
		if row.Name != nil {
			religionCounts[*row.Name] = row.Total
		} else {
			religionCounts["Belum Diisi"] = row.Total
		}
	}

	religionColors := []string{"#0ea5e9", "#6366f1", "#f97316", "#22c55e", "#eab308", "#ec4899", "#14b8a6"}
	religionData := []map[string]any{}
	for i, religion := range models.StaffReligions {
		religionData = append(religionData, map[string]any{
			"name":  religion,
			"value": religionCounts[religion],
			"color": religionColors[i%len(religionColors)],
		})
	}
	if count, ok := religionCounts["Belum Diisi"]; ok {
		religionData = append(religionData, map[string]any{"name": "Belum Diisi", "value": count, "color": "#94a3b8"})
	}

	genderCounts := map[string]int{}
	genderRows, _ := dbrepo.ListStaffGenderCounts(db)
	for _, row := range genderRows {
		if row.Name != nil {
			genderCounts[*row.Name] = row.Total
		} else {
			genderCounts["Belum Diisi"] = row.Total
		}
	}

	totalStaff := staffStats["total"]
	if totalStaff == 0 {
		totalStaff = 1
	}

	genderColors := []string{"#2563eb", "#f97316"}
	genderData := []map[string]any{}
	for i, gender := range models.StaffGenders {
		value := genderCounts[gender]
		genderData = append(genderData, map[string]any{
			"name":       gender,
			"value":      value,
			"percentage": int(float64(value) / float64(totalStaff) * 100),
			"color":      genderColors[i%len(genderColors)],
		})
	}
	if count, ok := genderCounts["Belum Diisi"]; ok {
		genderData = append(genderData, map[string]any{
			"name":       "Belum Diisi",
			"value":      count,
			"percentage": int(float64(count) / float64(totalStaff) * 100),
			"color":      "#94a3b8",
		})
	}

	educationCounts := map[string]int{}
	educationRows, _ := dbrepo.ListStaffEducationCounts(db)
	for _, row := range educationRows {
		if row.Name != nil {
			educationCounts[*row.Name] = row.Total
		} else {
			educationCounts["Belum Diisi"] = row.Total
		}
	}

	educationData := []map[string]any{}
	for _, level := range models.StaffEducationLevels {
		educationData = append(educationData, map[string]any{"level": level, "value": educationCounts[level]})
	}
	if count, ok := educationCounts["Belum Diisi"]; ok {
		educationData = append(educationData, map[string]any{"level": "Belum Diisi", "value": count})
	}

	divisionApplicants := []map[string]any{}
	divisionRows, _ := dbrepo.ListApplicationCountsByDivision(db)
	for _, row := range divisionRows {
		division := row.Division
		total := row.Total
		name := "Tidak ada divisi"
		if division != nil {
			name = *division
		}
		newCount, _ := dbrepo.CountApplicationsByDivisionBetween(db, division, currentMonthStart, now)
		divisionApplicants = append(divisionApplicants, map[string]any{
			"id":    name,
			"name":  name,
			"count": total,
			"new":   newCount,
		})
	}

	activityData := []map[string]any{}
	for i := 5; i >= 0; i-- {
		monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).AddDate(0, -i, 0)
		monthEnd := monthStart.AddDate(0, 1, 0).Add(-time.Second)
		registrations, _ := dbrepo.CountRegisteredUsersBetween(db, nil, monthStart, monthEnd)
		applications, _ := dbrepo.CountApplicationsSubmittedBetween(db, monthStart, monthEnd)
		activityData = append(activityData, map[string]any{
			"month":         monthStart.Format("Jan"),
			"registrations": registrations,
			"applications":  applications,
		})
	}
	recruitmentFunnel := buildRecruitmentFunnelData(db, currentMonthStart, now)

	c.JSON(http.StatusOK, gin.H{
		"stats":                stats,
		"statChanges":          statChanges,
		"userDistribution":     userDistribution,
		"activityData":         activityData,
		"staffStats":           staffStats,
		"religionData":         religionData,
		"genderData":           genderData,
		"educationData":        educationData,
		"divisionApplicants":   divisionApplicants,
		"recruitmentFunnel":    recruitmentFunnel,
		"sidebarNotifications": handlers.ComputeSuperAdminSidebarNotifications(db, user.ID),
	})
}

func buildRecruitmentFunnelData(db *sqlx.DB, start, end time.Time) []map[string]any {
	appliedCount, _ := dbrepo.CountApplicationsBySubmittedBetween(db, start, end)
	screeningCount := countApplicationsByStatusesBetween(db, start, end, []string{"Screening", "Interview", "Offering", "Hired"})
	interviewCount := countApplicationsByStatusesBetween(db, start, end, []string{"Interview", "Offering", "Hired"})
	offeringCount := countApplicationsByStatusesBetween(db, start, end, []string{"Offering", "Hired"})
	hiredCount := countApplicationsByStatusesBetween(db, start, end, []string{"Hired"})

	stageLabels := []string{"Lamaran Masuk", "Tahap Screening", "Tahap Interview", "Tahap Offering", "Diterima"}
	stageKeys := []string{"applied", "screening", "interview", "offering", "hired"}
	stageColors := []string{"#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#16a34a"}
	stageCounts := []int{appliedCount, screeningCount, interviewCount, offeringCount, hiredCount}

	for i := 1; i < len(stageCounts); i++ {
		if stageCounts[i] > stageCounts[i-1] {
			stageCounts[i] = stageCounts[i-1]
		}
	}

	funnelData := make([]map[string]any, 0, len(stageCounts))
	for i, count := range stageCounts {
		conversion := 100
		dropOff := 0
		if i > 0 {
			prev := stageCounts[i-1]
			dropOff = prev - count
			if prev > 0 {
				conversion = int((float64(count)/float64(prev))*100 + 0.5)
			} else {
				conversion = 0
			}
		}

		funnelData = append(funnelData, map[string]any{
			"key":        stageKeys[i],
			"label":      stageLabels[i],
			"value":      count,
			"conversion": conversion,
			"dropOff":    dropOff,
			"color":      stageColors[i],
		})
	}

	return funnelData
}

func countApplicationsByStatusesBetween(db *sqlx.DB, start, end time.Time, statuses []string) int {
	total := 0
	for _, status := range statuses {
		count, _ := dbrepo.CountApplicationsByStatusSubmittedBetween(db, status, start, end)
		total += count
	}
	return total
}

func ptr(v string) *string { return &v }
