import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "version-Beta/aqara-developer/aiot-api/introduction",
    },
    {
      type: "doc",
      id: "version-Beta/aqara-developer/aiot-api/getting-started-with-the-aiot-api",
      label: "Getting Started with the AIOT API",
    },
    {
      type: "doc",
      id: "version-Beta/aqara-developer/aiot-api/try-api-online",
      label: "Try API Online",
    },
    {
      type: "doc",
      id: "version-Beta/aqara-developer/aiot-api/aiot-api",
    },
    {
      type: "category",
      label: "Space",
      link: {
        type: "doc",
        id: "version-Beta/aqara-developer/aiot-api/space",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-spaces",
          label: "List Spaces",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/create-space",
          label: "Create A Space",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/update-space-name",
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
        id: "version-Beta/aqara-developer/aiot-api/device",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-device-types",
          label: "List Device Types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-devices",
          label: "List Devices",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-device-definitions",
          label: "Query Device Model Definition",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/execute-device-trait",
          label: "Control Devices by Traits",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-trait-values",
          label: "Query Trait Values",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/execute-device-command",
          label: "Control Devices by Commands",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
