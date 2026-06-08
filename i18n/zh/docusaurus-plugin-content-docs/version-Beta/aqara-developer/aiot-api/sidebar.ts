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
      label: "AIOT API 入门",
    },
    {
      type: "doc",
      id: "version-Beta/aqara-developer/aiot-api/try-api-online",
      label: "在线体验 API",
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
          label: "查询空间列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/create-space",
          label: "创建空间",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/update-space-name",
          label: "修改空间名称",
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
          label: "查询设备类型集合",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-devices",
          label: "查询设备信息列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-device-definitions",
          label: "查询设备详细信息",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/execute-device-trait",
          label: "通过 Trait 控制设备",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/get-trait-values",
          label: "查询 Trait 值",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/aiot-api/execute-device-command",
          label: "通过 Command 控制设备",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
