terraform {
  required_providers {
    proxmox = {
      source = "bpg/proxmox"
      version = ">=0.81.0"
    }
  }
}

provider "proxmox" {
	endpoint = var.pve_api_url
	insecure = true
	username = var.pve_api_username
	password = var.pve_api_password
	ssh {
		# node = var.pve_node_name
		# agent = true
	}
}

# Setup Networks
resource "proxmox_virtual_environment_network_linux_bridge" "vmbr01" {
	node_name = var.pve_node_name
	name = "vmbr01"
	comment = "DATA"
	ports = [
		var.mdc_network_data
	]
}

resource "proxmox_virtual_environment_network_linux_bridge" "vmbr02" {
	node_name = var.pve_node_name
	name = "vmbr02"
	comment = "TRUNK"
	ports = [
		var.mdc_network_trunk
	]
}

resource "null_resource" "proxmox_server_base_configuration" {
	depends_on = [
		proxmox_virtual_environment_network_linux_bridge.vmbr02
	]
	triggers = {
	#	always_run = timestamp()
	}
	
	connection {
		type = "ssh"
		user = var.pve_ssh_username
		password = var.pve_ssh_password
		host = var.pve_ssh_address
	}
	provisioner "remote-exec" {
		inline = [
			"pvesm set local --content import,iso,backup,snippets",
			"pvesh set /nodes/${var.pve_node_name}/network/${var.mdc_network_ctrl} -type eth --comments \"CTRL\"",
			"pvesh set /nodes/${var.pve_node_name}/network/${var.mdc_network_data} -type eth --comments \"DATA\"",
			"pvesh set /nodes/${var.pve_node_name}/network/${var.mdc_network_trunk} -type eth --comments \"TRUNK\"",
			"pvesh set /nodes/${var.pve_node_name}/network/vmbr0 -type bridge --comments \"CTRL\"",
			"ifreload -a"
		]
	}
}

# Upload OS ISO Images
resource "proxmox_virtual_environment_download_file" "cloud_ubuntu_server_24_04" {
	depends_on = [
		null_resource.proxmox_server_base_configuration
	]
	content_type = "import"
	datastore_id = "local"
	node_name = var.pve_node_name
	file_name = "noble-server-cloudimg-amd64.qcow2"
	url = "https://cloud-images.ubuntu.com/releases/noble/release/ubuntu-24.04-server-cloudimg-amd64.img"
}

# Create VM Templates
resource "null_resource" "ubuntu_cloud_init_template" {
	depends_on = [
		proxmox_virtual_environment_download_file.cloud_ubuntu_server_24_04,
		proxmox_virtual_environment_file.cloud_init_vendor_yaml,
		null_resource.proxmox_server_base_configuration
	]
	triggers = {
		always_run = timestamp()
	}
	
	connection {
		type = "ssh"
		user = var.pve_ssh_username
		password = var.pve_ssh_password
		host = var.pve_ssh_address
	}
	provisioner "remote-exec" {
		inline = [
			"qm destroy ${var.mdc_ubuntu_server_cloud_vmid} --destroy-unreferenced-disks 1",
			"qm create ${var.mdc_ubuntu_server_cloud_vmid} --name \"VM00.UbuntuServer-Cloud\" --ostype l26 --memory 1024 --agent enabled=1,fstrim_cloned_disks=1 --bios ovmf --machine q35 --efidisk0 local-lvm:0,pre-enrolled-keys=0 --cpu host --socket 1 --cores 1 --vga serial0 --serial0 socket --net0 virtio,bridge=vmbr0 --onboot=1",
    		"qm importdisk ${var.mdc_ubuntu_server_cloud_vmid} /var/lib/vz/import/${proxmox_virtual_environment_download_file.cloud_ubuntu_server_24_04.file_name} local-lvm",
    		"qm set ${var.mdc_ubuntu_server_cloud_vmid} --scsihw virtio-scsi-single --scsi0 local-lvm:vm-${var.mdc_ubuntu_server_cloud_vmid}-disk-1,discard=on,ssd=on",
    		"qm set ${var.mdc_ubuntu_server_cloud_vmid} --boot order=scsi0 --ide2 local-lvm:cloudinit",
    		"qm set ${var.mdc_ubuntu_server_cloud_vmid} --tags os_type.ubuntu,os_variant.server,template_vmid.${var.mdc_ubuntu_server_cloud_vmid}",
			"qm set ${var.mdc_ubuntu_server_cloud_vmid} --cicustom vendor=\"${proxmox_virtual_environment_file.cloud_init_vendor_yaml.datastore_id}:${proxmox_virtual_environment_file.cloud_init_vendor_yaml.content_type}/${proxmox_virtual_environment_file.cloud_init_vendor_yaml.file_name}\",user=\"${proxmox_virtual_environment_file.cloud_init_user_yaml.datastore_id}:${proxmox_virtual_environment_file.cloud_init_user_yaml.content_type}/${proxmox_virtual_environment_file.cloud_init_user_yaml.file_name}\"",
			"qm set ${var.mdc_ubuntu_server_cloud_vmid} --ciuser testbeduser --ciupgrade 1 --cipassword $(openssl passwd -6 testbeduser) --ipconfig0 ip=dhcp",
			"qm cloudinit update ${var.mdc_ubuntu_server_cloud_vmid}",
			"qm template ${var.mdc_ubuntu_server_cloud_vmid}"
		]
	}
}

resource "proxmox_virtual_environment_file" "cloud_init_vendor_yaml" {
	content_type = "snippets"
	datastore_id = "local"
	node_name = var.pve_node_name
	source_raw {
		data = <<-EOF
#cloud-config
packages:
  - qemu-guest-agent
package_update: true
		EOF
    	  	
    	  	file_name = "vendor.yaml"
	}
}

resource "proxmox_virtual_environment_file" "cloud_init_user_yaml" {
	content_type = "snippets"
	datastore_id = "local"
	node_name = var.pve_node_name
	source_raw {
		data = <<-EOF
#cloud-config
hostname: ubuntu-server
ssh_pwauth: true
chpasswd:
  expire: false
  users:
    - {name: testbeduser, password: testbeduser, type: text}
users:
  - { name: testbeduser, plain_text_password: testbeduser, shell: /bin/bash, sudo: "ALL=(ALL) NOPASSWD:ALL" }
runcmd:
  - systemctl start qemu-guest-agent
  - reboot
		EOF
    	  	
    	  	file_name = "user.yaml"
	}
}

