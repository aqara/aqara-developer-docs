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
          label: "查询空间列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/create-space",
          label: "创建空间",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-space-name",
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
        id: "version-Beta/aqara-developer/data-export-api/device",
      },
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-device-types",
          label: "查询设备类型列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-devices",
          label: "查询设备信息列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-device-definitions",
          label: "查询设备模型定义",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-device-trait",
          label: "通过 Trait 控制设备",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-trait-values",
          label: "查询 Trait 值",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-device-command",
          label: "通过 Command 控制设备",
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
          label: "开启网关子设备添加模式",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/stop-subdevice-join",
          label: "关闭网关子设备添加模式",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/get-device-bind-result",
          label: "查询子设备入网结果",
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
          label: "查询支持自动化的端点能力列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/create-automation",
          label: "创建自动化",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-automation-list",
          label: "查询自动化列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-automation-details",
          label: "查询自动化详情",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-automation",
          label: "编辑自动化",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-automation-status",
          label: "批量更新自动化状态",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/update-automation-space",
          label: "批量更新自动化关联空间",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/delete-automations",
          label: "删除自动化",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/query-automation-manual-trigger-list",
          label: "获取手动触发器列表",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-Beta/aqara-developer/data-export-api/execute-automation-manual-trigger",
          label: "执行手动触发器",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
