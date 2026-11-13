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
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/delete-space",
          label: "Delete A Space",
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
          id: "version-Beta/aqara-developer/data-export-api/get-device-filter-options",
          label: "Get Device Filter Options",
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
          label: "Query Device Definitions (Device Details)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/batch-device-capabilities",
          label: "Batch Query Device Matching Capabilities and Current Trait Values",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-matched-device-capabilities",
          label: "Query Single Device Matching Capabilities",
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
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-device-command-await",
          label: "Send Command to Device and Wait for Response",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-device-point-info",
          label: "Batch Query Device Point Information",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-device-name",
          label: "Update Device Name",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-device-point-name",
          label: "Update Device Point Name",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/delete-device-point",
          label: "Delete A Function",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/add-virtual-device",
          label: "Add A Virtual Device",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/bind-virtual-device-points",
          label: "Bind source device function points",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/unbind-virtual-device-points",
          label: "Unbind source device function points",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/unbind-device",
          label: "Unbind A Device",
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
          id: "version-Beta/aqara-developer/data-export-api/get-gateways",
          label: "List Gateways",
          className: "api-method get",
        },
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
          className: "api-method post",
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
      ],
    },
    {
      type: "category",
      label: "Firmware",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/firmware",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/search-upgradable-devices-firmware-by-device-ids",
          label: "Query Upgradable Device Firmware by Device IDs",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/upgrade-firmware",
          label: "Initiate Firmware Upgrade",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/search-firmware-upgrade-status",
          label: "Query Firmware Upgrade Progress and Result",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/cancel-upgrade-firmware",
          label: "Cancel Firmware Upgrade",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "History",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/history",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-device-point-history",
          label: "Query Device Trait Value Change History",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Studio",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/studio",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-studio-statistics",
          label: "Get Studio Statistics",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "EMS",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/ems",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-ems-trend-device",
          label: "Get Energy Consumption Trend of a Device",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-ems-trend-space",
          label: "Get Energy Consumption Trend of a Space",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-ems-total-device",
          label: "Get Energy Consumption of a Device",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-ems-total-space",
          label: "Query Energy Consumption for a Space",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-ems-summary-space",
          label: "Query Space Energy Consumption Summary",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-ems-summary-devices",
          label: "Query Multi-Device Energy Consumption Summary",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Event",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/event",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/report-external-event",
          label: "Report External System Event",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Scene",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/data-export-api/scene",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/create-scene",
          label: "Create A Scene",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-scene-list",
          label: "List Scenes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-scene",
          label: "Update A Scene",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-scene-space",
          label: "Associate Scene with Space",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-scene",
          label: "Execute A Scene",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/delete-scenes",
          label: "Delete Scenes",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-scene-details",
          label: "Query Scene Details",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
