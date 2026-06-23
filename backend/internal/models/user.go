package models

import authmodel "hris-backend/internal/models/auth"

type User = authmodel.User

const (
	RoleSuperAdmin = authmodel.RoleSuperAdmin
	RoleManagerHC  = authmodel.RoleManagerHC
	RoleAdmin      = authmodel.RoleAdmin
	RoleStaff      = authmodel.RoleStaff
	RolePelamar    = authmodel.RolePelamar
)

var UserRoles = authmodel.UserRoles
var AssignableUserRoles = authmodel.AssignableUserRoles
var UserStatuses = authmodel.UserStatuses
