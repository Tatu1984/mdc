output "proxmox_api_token" {
	value = "${proxmox_virtual_environment_user_token.usertoken_MDCApi.id}!${proxmox_virtual_environment_user_token.usertoken_MDCApi.value}"
	sensitive = true
}
