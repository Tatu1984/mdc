variable "pve_api_url" {
	description = "Proxmox API Endpoint, e.g. 'https://pve.example.com/api2/json'"
  	type        = string
  	validation {
    		condition     = can(regex("(?i)^http[s]?://.*/api2/json$", var.pve_api_url))
    		error_message = "Proxmox API Endpoint Invalid. Check URL - Scheme and Path required."
  	}
}

variable "pve_api_username" {
	type = string
}

variable "pve_api_password" {
	type = string
	sensitive = true
}

variable "pve_ssh_username" {
	type = string
}

variable "pve_ssh_password" {
	type = string
	sensitive = true
}

variable "pve_ssh_address" {
	type = string
}

variable "pve_node_name" {
	type = string
}

variable "mdc_network_ctrl" {
	type = string
}

variable "mdc_network_data" {
	type = string
}

variable "mdc_network_trunk" {
	type = string
}

variable "mdc_ubuntu_desktop_vmid" {
	type = string
	default = 99100
}

variable "mdc_opnsense_gw_vmid" {
	type = string
	default = 99101
}

variable "mdc_ubuntu_server_vmid" {
	type = string
	default = 99102
}

variable "mdc_alpine_gw_vmid" {
	type = string
	default = 99104
}

variable "mdc_ubuntu_server_cloud_vmid" {
	type = string
	default = 99106
}