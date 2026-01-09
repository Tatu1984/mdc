# See https://registry.terraform.io/providers/bpg/proxmox/latest/docs/resources/virtual_environment_vm

resource "proxmox_virtual_environment_vm" "ubuntu_desktop_base_vm" {
  depends_on = [
		proxmox_virtual_environment_download_file.ubuntu_desktop_24_04_3
	]

  name        = "VM00.UbuntuDesktop"
  tags        = ["os_type.ubuntu", "os_variant.desktop", "template_vmid.${var.mdc_ubuntu_desktop_vmid}"]

  node_name = var.pve_node_name
  vm_id     = var.mdc_ubuntu_desktop_vmid

  agent {
    # read 'Qemu guest agent' section, change to true only when ready
    enabled = true
    trim = true
  }
  # if agent is not enabled, the VM may not be able to shutdown properly, and may need to be forced off
 
  on_boot = true
  started = false

  cpu {
    cores        = 2
    type         = "host"  # recommended for modern CPUs
  }

  memory {
    dedicated = 4096
    floating  = 4096 # set equal to dedicated to enable ballooning
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    iothread = true
    discard = "on"
    ssd = true
    size = 50
  }

  scsi_hardware = "virtio-scsi-single"

  bios = "ovmf"

  efi_disk {
    datastore_id = "local-lvm"
    type = "4m"
    pre_enrolled_keys = true
  }

  network_device {
    bridge = "vmbr0"
    firewall = true
  }

  operating_system {
    type = "l26"
  }

  cdrom {
    file_id = proxmox_virtual_environment_download_file.ubuntu_desktop_24_04_3.id
    interface = "ide2"
  }
}

resource "proxmox_virtual_environment_vm" "ubuntu_server_base_vm" {
  depends_on = [
		proxmox_virtual_environment_download_file.live_ubuntu_server_24_04_3
	]

  name        = "VM00.UbuntuServer-Live"
  tags        = ["os_type.ubuntu", "os_variant.server", "template_vmid.${var.mdc_ubuntu_server_vmid}"]

  node_name = var.pve_node_name
  vm_id     = var.mdc_ubuntu_server_vmid

  agent {
    # read 'Qemu guest agent' section, change to true only when ready
    enabled = true
    trim = true
  }
  # if agent is not enabled, the VM may not be able to shutdown properly, and may need to be forced off
 
  on_boot = true
  started = false

  cpu {
    cores        = 2
    type         = "host"  # recommended for modern CPUs
  }

  memory {
    dedicated = 4096
    floating  = 4096 # set equal to dedicated to enable ballooning
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    iothread = true
    discard = "on"
    ssd = true
    size = 50
  }

  scsi_hardware = "virtio-scsi-single"

  bios = "ovmf"

  efi_disk {
    datastore_id = "local-lvm"
    type = "4m"
    pre_enrolled_keys = true
  }

  network_device {
    bridge = "vmbr0"
    firewall = true
  }

  operating_system {
    type = "l26"
  }

  cdrom {
    file_id = proxmox_virtual_environment_download_file.live_ubuntu_server_24_04_3.id
    interface = "ide2"
  }
}

resource "proxmox_virtual_environment_vm" "alpine_gw_base_vm" {
  depends_on = [
		proxmox_virtual_environment_download_file.alpine_virt_3_22_1
	]

  name        = "GW00.Alpine"
  tags        = ["os_type.alpine", "os_variant.server", "template_vmid.${var.mdc_alpine_gw_vmid}", "gw_lan_networkinterface.net1"]

  node_name = var.pve_node_name
  vm_id     = var.mdc_alpine_gw_vmid

  agent {
    # read 'Qemu guest agent' section, change to true only when ready
    enabled = true
    trim = true
  }
  # if agent is not enabled, the VM may not be able to shutdown properly, and may need to be forced off
 
  on_boot = true
  started = false

  cpu {
    cores        = 1
    type         = "host"  # recommended for modern CPUs
  }

  memory {
    dedicated = 320
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    iothread = true
    discard = "on"
    ssd = true
    size = 1
  }

  scsi_hardware = "virtio-scsi-single"

  network_device {
    bridge = "vmbr0"
    firewall = true
  }

  network_device {
    bridge = "vmbr02"
    firewall = true
  }

  operating_system {
    type = "l26"
  }

  cdrom {
    file_id = proxmox_virtual_environment_download_file.alpine_virt_3_22_1.id
    interface = "ide2"
  }
}

resource "proxmox_virtual_environment_vm" "opnsense_gw_base_vm" {
  depends_on = [
		proxmox_virtual_environment_download_file.opnsense_25_7
	]

  name        = "GW00.OpnSense"
  tags        = ["os_type.opnsense", "os_variant.server", "template_vmid.${var.mdc_opnsense_gw_vmid}", "gw_lan_networkinterface.net0"]

  node_name = var.pve_node_name
  vm_id     = var.mdc_opnsense_gw_vmid

  agent {
    # read 'Qemu guest agent' section, change to true only when ready
    enabled = true
    trim = true
  }
  # if agent is not enabled, the VM may not be able to shutdown properly, and may need to be forced off
 
  on_boot = true
  started = false

  cpu {
    cores        = 1
    type         = "host"  # recommended for modern CPUs
  }

  memory {
    dedicated = 4096
    floating  = 4096 # set equal to dedicated to enable ballooning
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    iothread = true
    discard = "on"
    ssd = true
    size = 1
  }

  scsi_hardware = "virtio-scsi-single"

  network_device {
    bridge = "vmbr0"
    firewall = true
  }

  network_device {
    bridge = "vmbr02"
    firewall = true
  }

  operating_system {
    type = "l26"
  }

  cdrom {
    file_id = proxmox_virtual_environment_download_file.opnsense_25_7.id
    interface = "ide2"
  }
}

# Upload OS ISO Images
resource "proxmox_virtual_environment_download_file" "ubuntu_desktop_24_04_3" {
	depends_on = [
		null_resource.proxmox_server_base_configuration
	]
	content_type = "iso"
	datastore_id = "local"
	node_name = var.pve_node_name
	url = "https://releases.ubuntu.com/noble/ubuntu-24.04.3-desktop-amd64.iso"
}

resource "proxmox_virtual_environment_download_file" "live_ubuntu_server_24_04_3" {
	depends_on = [
		null_resource.proxmox_server_base_configuration
	]
	content_type = "iso"
	datastore_id = "local"
	node_name = var.pve_node_name
	url = "https://releases.ubuntu.com/noble/ubuntu-24.04.3-live-server-amd64.iso"
}

resource "proxmox_virtual_environment_download_file" "alpine_virt_3_22_1" {
	depends_on = [
		null_resource.proxmox_server_base_configuration
	]
	content_type = "iso"
	datastore_id = "local"
	node_name = var.pve_node_name
	url = "https://dl-cdn.alpinelinux.org/alpine/v3.22/releases/x86_64/alpine-virt-3.22.1-x86_64.iso"
}

resource "proxmox_virtual_environment_download_file" "opnsense_25_7" {
	depends_on = [
		null_resource.proxmox_server_base_configuration
	]
	content_type = "iso"
	datastore_id = "local"
	node_name = var.pve_node_name
	decompression_algorithm = "bz2"
	file_name = "OPNsense-25.7-dvd-amd64.iso.bz2.iso"
	url = "https://mirror.ams1.nl.leaseweb.net/opnsense/releases/25.7/OPNsense-25.7-dvd-amd64.iso.bz2"
}