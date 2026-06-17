import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "version-Beta/aqara-developer/data-export-api/data-export-api",
    },
    {
      type: "category",
      label: "Space",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/space",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-spaces",
          label: "List Spaces",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/create-space",
          label: "Create A Space",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-space-name",
          label: "Update A Space Name",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Device",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/device",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-device-types",
          label: "List Device Types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-devices",
          label: "List Devices",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-device-definitions",
          label: "Query Device Model Definition",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-device-trait",
          label: "Control Devices by Traits",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-trait-values",
          label: "Query Trait Values",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-device-command",
          label: "Control Devices by Commands",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Gateway",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/gateway",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/join-subdevice",
          label: "Enable Sub-device Joining",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/stop-subdevice-join",
          label: "Disable Sub-device Joining",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-device-bind-result",
          label: "Query Sub-device Joining Results",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Automation",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/automation",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-automation-capabilities",
          label: "List Endpoint Capabilities for Automation",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/create-automation",
          label: "Create An Automation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-automation-list",
          label: "List Automations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-automation-details",
          label: "Query Automation Details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-automation",
          label: "Edit An Automation",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-automation-status",
          label: "Batch Update Automation Statuses",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-automation-space",
          label: "Update Space Association for Automations",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/delete-automations",
          label: "Delete Automations",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-automation-manual-trigger-list",
          label: "Get Manual Trigger List",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-automation-manual-trigger",
          label: "Execute A Manual Trigger",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
