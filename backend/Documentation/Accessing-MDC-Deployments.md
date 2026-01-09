# Overview
The Micro Datacenter is designed to maintain security and segmentation of the interfaces, networking, and workloads.  These resources are grouped into the following areas and access to these resources is dependent on the user's role or persona. 

|Area|Allowed Roles|Accessible User Interfaces|ZeroTier Network ID| Notes|
|--|--|--|--|--|
|Administration|-Administrator<br>-Technician|-MDC App Web/API<br>-MDC App Host<br>-ProxMox Host Admin<br>-CTRL/DATA Router Mgmt<br>-Device Switch Mgmt| 868d2ef021e8d828|Administrators and Technicians deploy, monitor and maintain the MDC infrastructure.  They have access to all resources and Workspaces, but do not have the ability to login to Workspace VMs or access data within a Workspace|
|Management|Project Manager|-MDC App Web/API| 868d2ef02182ffa9 |Project Managers create, update, manage Workspaces and Projects for Product Users.   A Workspace Manager only has access to Workspaces and Projects within their Organization.|
|-Workspace<br>-Project|Product User|-MDC App Web/API<br>-Workspace Resources | -Workspace Specific<br>-Project Specific| Product Users may be granted access to the Management area ZeroTier Network and the MDC App published there, and can only access the Console for VMs and Devices within the Workspaces of their Organization |

# References
- ZeroTier Controller Web UI (AWS hosted, Source IP restricted): https://54.163.29.130:3443/

# Network Topology

Processing 1 inserted images..![==image_0==.png](/.attachments/==image_0==-f6a184f3-80e3-4070-bf36-3e62f7cb05da.png) .