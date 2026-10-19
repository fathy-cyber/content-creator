import type { ModuleManifest } from "@ayech/core/types";

const manifest: ModuleManifest = {
  id: "mod-analytics",
  name: "Analytics Dashboard",
  version: "1.0.0",
  description: "test module creation.must be removed !",
  icon: "bar-chart-2",
  color: "#6366F1",
  author: "Ayech AI Team",
  category: "ai-tools",
  tags: [],
  depends: ["mod-dashboard"],
  coreVersion: ">=1.0.0",
  tier: "free",

  navigation: {
    menuItem: {
      label: "Analytics Dashboard",
      icon: "bar-chart-2",
      path: "/analytics",
      order: 100,
    },
    subMenuItems: [],
  },

  routes: [],

  apiRoutes: [],
  widgets: [],
  commands: [],
  hooks: [],
  extends: [],
  migrations: [],

  lifecycle: {
    onInstall: async () => {
      console.log("[mod-analytics] Installed successfully");
    },
    onUninstall: async () => {
      console.log("[mod-analytics] Uninstalled");
    },
    onEnable: async () => {
      console.log("[mod-analytics] Enabled");
    },
    onDisable: async () => {
      console.log("[mod-analytics] Disabled");
    },
  },
};

export default manifest;
