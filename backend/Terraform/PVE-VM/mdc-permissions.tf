# Setup Permissions
resource "proxmox_virtual_environment_role" "MDCApiUser_role" {
	role_id = "MDCApiUser"
	privileges = [
		"Sys.Audit",
		"VM.Audit",
		"VM.Clone",
		"VM.Allocate",
		"VM.Config.Network",
		"VM.PowerMgmt",
		# "VM.Monitor",  -- Removed in Proxmox 9.0
		"VM.GuestAgent.Unrestricted",
		"Datastore.AllocateSpace",
		"Datastore.Audit",
		"SDN.Use"
	]
}

resource "proxmox_virtual_environment_group" "MDCApiAccess_group" {
	comment = "MDC Api Application"
	group_id = "MDCApiAccess"
	
	acl {
		path = "/"
		propagate = true
		role_id = proxmox_virtual_environment_role.MDCApiUser_role.role_id
	}
}

resource "proxmox_virtual_environment_user" "MDCApiApplication_user" {
	comment = "MDC Api Application"
	user_id = "MDCApiApplication@pve"
	password = "SDNlab123"
	groups = [
		proxmox_virtual_environment_group.MDCApiAccess_group.group_id
	]
}

resource "proxmox_virtual_environment_user_token" "usertoken_MDCApi" {
	comment = "MDC Api Application"
	token_name = "MDCApi"
	user_id = proxmox_virtual_environment_user.MDCApiApplication_user.user_id
	privileges_separation = false
}