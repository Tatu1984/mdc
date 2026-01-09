# URLs

Micro DataCenter supports the following URLs:

* \~/odata - REST Endpoint
* \~/$odata - OData Endpoint Mappings
* \~/openapi/v1.json - OpenApi Schema
* \~/swagger - Swagger UI
* \~/scalar - Scalar UI

# Resource Actions

| Resource | Path | Description | Verb | Path | Parameters | Body | Response |
| -------- | ---- | ----------- | ---- | ---- | ---------- | ---- | -------- |
| Site | /odata/Sites |  |  |  |  |  |  |
| Workspace | /odata/Workspaces |  |  |  |  |  |  |
|  |  | Get Sites | GET | /odata/Sites |  |  | Site Object |
|  |  | Get Site Datacenter Properties | GET | /odata/Datacenter |  |  | Datacenter Object |
|  |  | Get Workspaces | GET | /odata/{site}/Workspaces |  |  | Array of Workspace Object |
|  |  | Create Workspace | POST | /odata/{site}/Workspaces |  | WorkspaceDescriptor Object | Workspace Object |
|  |  | Get Workspace Detail | GET | /odata/{site}/Workspaces({id}) |  |  | Workspace Object |
|  |  | Modify Workspace | PATCH | /odata/{site}/Workspaces({id}) |  | Delta of WorkspaceDescriptor Object | Workspace Object |
|  |  | Remove Workspace | DELETE | /odata/{site}/Workspaces({id}) |  |  | -no response- |

### Resource: Site

| Description | Verb | Path | Parameters | Body | Response | Notes |
| ----------- | ---- | ---- | ---------- | ---- | -------- | ----- |
| Get Sites | GET | /odata/Sites |  |  | Array of Site Object | Does not contact the Site or include details such as Templates and Devices |
| Get Site Detail | GET | /odata/Sites({SiteId}) |  |  | Single Site Object | Contacts the Site and Includes details such as Templates and Devices |
| Create Site | POST | /odata/Sites |  | \<SiteDescriptor><br>{<br> "memberAddress": "\<string>", // Required<br> "registrationUserName": "\<string>", // Required<br> "registrationPassword": "\<string>", // Required<br> "description": "\<string>", // Optional<br> "port": integer, // Optional port for connecting to PVE API, defaults to 8006<br> "timeout": integer, // Optional HTTP timeout for connecting to PVE API, defaults to 30<br> "organizationIds": [\<array of "string">], // Optional list of OrganizationIds authorized to use the site<br> "importOrganizationId": "\<string>" // Optional OrganizationId to assign existing Workspaces to<br>} | Site Object |  |
| Modify Site | PATCH | /odata/Sites('{SideId}') | SiteId |  |  | Not Implemented |
| Remove Site | DELETE | /odata/Sites('{SideId}') | SiteId |  |  | Not Implemented |
| Create Workspace | POST | /odata/Sites('{SideId}')/Workspaces | SiteId | \<WorkspaceDescriptor Object> | Workspace Object | Creates a Workspace at a Site using the specified WorkspaceDescriptor |

### Resource: Workspace

| Description | Verb | Path | Parameters | Body | Response | Notes |
| ----------- | ---- | ---- | ---------- | ---- | -------- | ----- |
| Get Workspaces | GET | /odata/Workspaces |  |  | Array of Workspace Object | Does not contact the Site or include details such as Virtual Machines in the Workspace |
| Get Workspace | GET | /odata/Workspaces({WorkspaceId}) |  |  | Single Workspace Object | Contacts the Site and includes details such as Virtual Machines in the Workspace |
| Modify Site | PATCH | /odata/Workspaces({WorkspaceId})/Descriptor |  | \<WorkspaceDescriptor Object> | \<WorkspaceDescriptor Object> | Modify Workspace using Workspace Descriptor |

# Schema

## WorkspaceDescriptor Object

```json
{
  "name": "",     // Required when creating a Workspace
  "bastion": {     // Optional. When not specified, a Bastion will be created using default values
    "templateName": null,     // Optional.  When not specified, the default Bastion Template Name will be used
    "templateRevision": null,     // Optional.  When not specified, the default Bastion Template Revision or the highest revision for the templateName will be used
    "operation": "None"     // Optional.  Acceptable values are None, Add, Update, Reboot, Restart, Redeploy
  },
  "virtualNetworks": [     // Optional. Whether specified or not, there will always be at minimum one Primary Virtual Network having wanNetworkType = Egress
    {
      "name": null,     // Optional.  When not specified, the name "vnetXX" will be generated, where XX is a zero padded incrementing number starting with 0 for the next available unique value.   Virtual Network Names must be unique within a Workspace.   
      "gateway": {     // Optional.  When not specified, and this is the Primary Virtual Network, a Gateway will automatically be used using default values
        "templateName": null,     // Optional.  When not specified, the default Gateway Template Name will be used
        "templateRevision": null,    // Optional.  When not specified, the default Gateway Template Revision or the highest revision for the templateName will be used
        "wanNetworkType": "Egress",     // Optional.  Acceptable values are Egress, Internal, Public.  When not specified, and this is the only Virtual Network, wanNetworkType will be Egress; additional Virtual Networks will be Internal.   The Public value is only acceptable when the Micro Datacenter configuration supports it.
        "refInternalWANVirtualNetworkName": null,     // Optional.  Only valid when wanNetworkType = Internal.  Acceptable value must be the Name of any Virtual Network in the Workspace, except this Virtual Network. 
        "operation": "None"     // Optional.  Acceptable values are None, Add, Update, Remove, Reboot, Restart, Redeploy.  The Gateway cannot be removed for the Primary Virtual Network
      },
      "enableRemoteNetwork": true,    // Optional.  When not specified, the default value is false.  When true a new ZeroTier network will be created on the configured ZeroTier controller
      "remoteNetworkAddressCIDR": null,     // Optional.   Only valid when enableRemoteNetwork = true.  Value must be a valid Network Address in CIDR notation.  When not specified and enableRemoteNetwork = true, the default value from Datacenter settings is used
      "remoteNetworkIPRangeStart": null,     // Optional.  Only valid when enableRemoteNetwork = true and remoteNetworkAddressCIDR has a value.  The IP Address must be within the Network Domain of remoteNetworkAddressCIDR.  When not specified and enableRemoteNetwork = true, the default value from Datacenter settings is used
      "remoteNetworkIPRangeEnd": null,     // Optional.  Only valid when enableRemoteNetwork = true and remoteNetworkAddressCIDR has a value.  The IP Address must be within the Network Domain of remoteNetworkAddressCIDR.  When not specified and enableRemoteNetwork = true, the default value from Datacenter settings is used
      "remoteNetworkBastionIPAddress": null,     // Optional.  Only valid when enableRemoteNetwork = true and remoteNetworkAddressCIDR has a value.  The IP Address must be within the Network Domain of remoteNetworkAddressCIDR, and not between remoteNetworkIPRangeStart and remoteNetworkIPRangeEnd.  When not specified and enableRemoteNetwork = true, the default value from Datacenter settings is used
      "operation": "None"     // Optional.  Acceptable values are None, Add, update, Remove.   When operation = Remove, the Name property must be specified.  The Primary Virtual Network cannot be removed.  When not specified and Name is not specified, the operation will be Add.  When not specified and Name is specified, when there is an existing Virtual Network having the same name, the operation will be Update.  When not specified and the Name is specified, when there is not an existing Virtual Network having the same name, the operation will be Add.
    }
  ],
  "virtualMachines": [     // Optional
    {
      "name": null,     // Optional.  When not specified, the name "VirtualMachineXX" will be generated, where XX is a zero padded incrementing number starting with 0 for the next available unique value.   Virtual Machine Names must be unique with a Workspace
      "templateName": "",     // Required when adding a Virtual Machine.  Invalid when Removing a Virtual Machine.  Optional with all other Operations.
      "templateRevision": null,     // Optional.  When not specified, the highest available Revision for the Template will be used.
      "networkAdapters": [     // Optional.  When not specified, the Virtual Machine will have one Network Adapter and it will be connected to the Primary Virtual Network
        {
          "name": null,     // Optional.  When not specified, the name "netX" will be generated where X is a zero padded incrementing number starting with 0 for the next available unique value.  Network Adapter Names must be unique within a Virtual Machine.
          "refVirtualNetworkName": null,     // Optional.   When not specified, the Primary Virtual Network will be used.  Acceptable value must be the Name of any Virtual Network in the Workspace. 
          "macAddress": null,     // Optional.  When not specified a MAC Address will be auto-generated.  
          "isDisconnected": null,     // Optional.  Default value is false
          "isFirewallEnabled": null,     // Optional.  Default value is true
          "enableRemoteNetwork": true,     // Optional.  Default value is false.  True is only acceptable when the Virtual Network specified in refVirtualNetworkName has enableRemoteNetwork = true.  
          "remoteNetworkIPAddress": null     // Optional.  Default value is null.  A value is only acceptable when enableRemoteNetwork = true.  The value must be a valid IP address between the remoteNetworkIPRangeStart and remoteNetworkIPRangeEnd value of the Virtual Network specified in refVirtualNetworkName.
          "operation": "None"     // Optional.  Acceptable values are None, Add, update, Remove.   When operation = Remove, the Name property must be specified. When not specified and Name is not specified, the operation will be Add.  When not specified and Name is specified, when there is an existing Network Adapter having the same name for this Virtual Machine, the operation will be Update.  When not specified and the Name is specified, when there is not an existing Network Adapter for this Virtual Machine having the same name, the operation will be Add.
        }
      ],
      "operation": "None"     // Optional.  Acceptable values are None, Add, update, Remove.   When operation = Remove, the Name property must be specified.  When not specified and Name is not specified, the operation will be Add.  When not specified and Name is specified, when there is an existing Virtual Machine having the same name, the operation will be Update.  When not specified and the Name is specified, when there is not an existing Virtual Machine having the same name, the operation will be Add.
    }
  ]
}
```