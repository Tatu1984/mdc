  
1.  Create Azure Web App
    1.  ResourceGroup=microdatacentercentral_group
    2.  Name=microdatacentercentral
    3.  Region=CentralUS
    4.  Plan=Basic B1
    5.  Runtime=.NET 9
    6.  Deployment=Container
2.  Create Azure VM
    1.  Basics
        1.  ResourceGroup=microdatacentercentral_group
        2.  Name=ztbridge
        3.  Region=CentralUS
        4.  SecurityType=Standard
        5.  Size=Standard_B1ls
        6.  Username=azureuser
        7.  Public inbound ports=None
    2.  Disks
        1.  OS disk type = Standard SSD
    3.  Networking
        1.  Virtual Network: Address Space=172.18.0.0/16
        2.  Subnet=172.18.0.0/24
        3.  Public IP=none
    4.  Monitoring
        1.  Enable recommended alert rules
    5.  Download Private Key  
        ztbridge_key.pem
3.  Setup Azure VM
    1.  Install ZeroTier and join central.zerotier.com network:

| Operations | Run Command | RunShellScript<br> | curl -s [https://install.zerotier.com](https://install.zerotier.com) | sudo bash<br>sudo zerotier-cli join 8d1c312afa44417e<br> |
| --- | --- |

1.  Set Member Name, IP and Authorize(central.zerotier.com)  
    ZT IP = 10.255.255.2
2.  Connect via SSH (MobaXTerm)  
    username = azureuser  
    identity = ztbridge_key.pem
3.  Install Docker

| S<br>SH Shell<br> | sudo apt install ca-certificates curl -y<br>sudo install -m 0755 -d /etc/apt/keyrings<br>sudo curl -fsSL [https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc](https://download.docker.com/linux/ubuntu/gpg%20-o%20/etc/apt/keyrings/docker.asc)<br>sudo chmod a+r /etc/apt/keyrings/docker.asc<br>echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] [https://download.docker.com/linux/ubuntu](https://download.docker.com/linux/ubuntu) $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null<br>sudo apt update -y<br>sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y<br> |
| --- | --- |

1.  Install Zero UI

| Instructions<br> | [https://github.com/dec0dOS/zero-ui/tree/main?tab=readme-ov-file#getting-started](https://github.com/dec0dOS/zero-ui/tree/main?tab=readme-ov-file#getting-started)<br> |
| --- | --- |
| SSH Shell<br> | sudo su<br>mkdir -p /srv/zero-ui<br>cd /srv/zero-ui<br> |
| vi docker-compose.yml<br> | version: "3"<br><br><br>services:<br>  zero-ui:<br>    image: dec0dos/zero-ui:latest<br>    container_name: zu-main<br>    build:<br>      context: .<br>      dockerfile: ./docker/zero-ui/Dockerfile<br>    restart: unless-stopped<br>    volumes:<br>      - /var/lib/zerotier-one:/var/lib/zerotier-one<br>      - ./data:/app/backend/data<br>    environment:<br>      - ZU_CONTROLLER_ENDPOINT=http://10.255.255.3:9993/<br>      - ZU_SECURE_HEADERS=false<br>      - ZU_DEFAULT_USERNAME=admin<br>      - ZU_DEFAULT_PASSWORD=SDNlab123!<br>    network_mode: "host"<br>    ports:<br>      - "4000:4000"<br> |
| <br><br> | docker pull dec0dos/zero-ui  <br> <br>ufw allow 80/tcp<br>ufw allow 443/tcp<br>ufw allow 9993/udp<br>  <br>echo "{\"settings\": {\"portMappingEnabled\": true,\"softwareUpdate\": \"disable\",\"allowManagementFrom\": [\"0.0.0.0/0\"]}}" > /var/lib/zerotier-one/local.conf<br>  <br>docker compose up -d --no-build<br> |
| Web Browser<br> | [http://10.255.255.2:4000/app/](http://10.255.255.2:4000/app/)<br> |

1.  Create MDC Administration Network
    1.  Login to Zero-UI ([http://10.255.255.2:4000/app/](http://10.255.255.2:4000/app/)) admin/SDNlab123!
    2.  Create Network and update settings:
        1.  Name=MDC Administration
        2.  Description=Network for MDC Proxmox Administration Proxy
        3.  Managed Routes=10.254.0.0/16
        4.  Auto-Assign Pools=10.254.254.2-10.254.254.254
    3.  NOTE:
        1.  The Controller's Member IP Assignment will be 10.254.254.1
        2.  The dynamic IP address range is 10.254.254.2 to 10.254.254.254
        3.  All of the remaining address (10.254.0.2 to 10.254.254.254) are used by Micro Datacenter Hosts and have static IP addresses.  
2.  Create Bridge
    1.  Join Controller to the MDC Administration network with SSH Shell: "sudo zerotier-cli join <network id>"
    2.  Edit settings for CONTROLLER member
        1.  Name=MDC Bridge
        2.  Managed IP=10.254.254.1
        3.  Authorized=Checked