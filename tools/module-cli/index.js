#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════
 * AYECH AI — Module CLI
 * ═══════════════════════════════════════════════════════════
 * Scaffolds new modules with the correct structure,
 * manifest, and boilerplate files.
 *
 * Usage:
 *   pnpm module:create
 *   node tools/module-cli/index.js create
 * ═══════════════════════════════════════════════════════════
 */
const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const { createPromptModule } = inquirer;
const prompt = createPromptModule();
const { Command } = require("commander");
const program = new Command();

// ─── CREATE COMMAND ─────────────────────────────────────────

program
  .command("create")
  .description("Create a new Ayech AI module")
  .action(async () => {
    console.log("\n🧩 Ayech AI — New Module Scaffolder\n");

    // Prompt utilisateur
    const answers = await prompt([
      {
        type: "input",
        name: "id",
        message: "Module ID (e.g., analytics, crm, invoicing):",
        validate: (input) => {
          if (!input) return "Module ID is required";
          if (!/^[a-z][a-z0-9-]*$/.test(input))
            return "Use lowercase letters, numbers, and hyphens only";
          return true;
        },
      },
      {
        type: "input",
        name: "name",
        message: "Display name (e.g., Analytics Dashboard):",
        validate: (input) => (input ? true : "Name is required"),
      },
      {
        type: "input",
        name: "description",
        message: "Brief description:",
        default: "A custom Ayech AI module",
      },
      {
        type: "list",
        name: "category",
        message: "Category:",
        choices: ["core", "addon", "premium", "community"],
        default: "addon",
      },
      {
        type: "list",
        name: "tier",
        message: "Minimum subscription tier:",
        choices: ["free", "pro", "business"],
        default: "free",
      },
      {
        type: "input",
        name: "icon",
        message: "Lucide icon name (e.g., bar-chart-2):",
        default: "box",
      },
      {
        type: "input",
        name: "color",
        message: "Accent color (hex):",
        default: "#6366F1",
      },
      {
        type: "input",
        name: "author",
        message: "Author:",
        default: "Ayech AI Team",
      },
    ]);

    console.log("Module info:", answers);

    const moduleDir = path.resolve(
      __dirname,
      `../../modules/@ayech/mod-${answers.id}`
    );
      	
    if (fs.existsSync(moduleDir)) {
      console.error(`\n❌ Module directory already exists: ${moduleDir}`);
      process.exit(1);
    }

    // Create directory structure
    const dirs = [
      "",
      "/src",
      "/src/pages",
      "/src/components",
      "/src/services",
      "/src/stores",
      "/src/api",
      "/src/hooks",
      "/src/locales",
      "/migrations",
      "/tests",
    ];

    dirs.forEach((dir) => fs.ensureDirSync(path.join(moduleDir, dir)));

    // ─── Generate manifest.ts ───
    const manifestContent = `import type { ModuleManifest } from "@ayech/core/types";

const manifest: ModuleManifest = {
  id: "mod-${answers.id}",
  name: "${answers.name}",
  version: "1.0.0",
  description: "${answers.description}",
  icon: "${answers.icon}",
  color: "${answers.color}",
  author: "${answers.author}",
  category: "${answers.category}",
  tags: [],
  dependencies: ["mod-dashboard"],
  coreVersion: ">=1.0.0",
  tier: "${answers.tier}",

  navigation: {
    menuItem: {
      label: "${answers.name}",
      icon: "${answers.icon}",
      path: "/${answers.id}",
      order: 100,
    },
    subMenuItems: [],
  },

  routes: [
    {
      path: "/${answers.id}",
      component: "./src/pages/Landing",
      auth: true,
      tier: "${answers.tier}",
      title: "${answers.name}",
      breadcrumb: ["${answers.name}"],
    },
  ],

  apiRoutes: [],
  widgets: [],
  commands: [],
  hooks: [],
  extends: [],
  migrations: [],

  lifecycle: {
    onInstall: async () => {
      console.log("[mod-${answers.id}] Installed successfully");
    },
    onUninstall: async () => {
      console.log("[mod-${answers.id}] Uninstalled");
    },
    onEnable: async () => {
      console.log("[mod-${answers.id}] Enabled");
    },
    onDisable: async () => {
      console.log("[mod-${answers.id}] Disabled");
    },
  },
};

export default manifest;
`;

    fs.writeFileSync(path.join(moduleDir, "manifest.ts"), manifestContent);

    // ─── Generate package.json ───
    const packageJson = {
      name: `@ayech/mod-${answers.id}`,
      version: "1.0.0",
      private: true,
      description: answers.description,
      main: "./src/index.ts",
      types: "./src/index.ts",
      scripts: {
        typecheck: "tsc --noEmit",
        lint: "eslint src/ --ext .ts,.tsx",
        test: "vitest run",
        clean: "rm -rf dist .turbo",
      },
      dependencies: {
        "@ayech/core": "workspace:*",
        "@ayech/ui": "workspace:*",
        "@ayech/shared": "workspace:*",
      },
      devDependencies: {
        "@types/react": "^18.3.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
        typescript: "^5.4.0",
      },
      peerDependencies: {
        react: ">=18.0.0",
        "react-dom": ">=18.0.0",
      },
    };

    fs.writeJsonSync(path.join(moduleDir, "package.json"), packageJson, {
      spaces: 2,
    });

    // ─── Generate tsconfig.json ───
    const tsconfig = {
      extends: "../../../tsconfig.base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
        noEmit: true,
        jsx: "react-jsx",
        baseUrl: ".",
        paths: {
          "@ayech/core": ["../../packages/@ayech/core/src"],
          "@ayech/core/*": ["../../packages/@ayech/core/src/*"],
          "@ayech/ui": ["../../packages/@ayech/ui/src"],
          "@ayech/ui/*": ["../../packages/@ayech/ui/src/*"],
          "@ayech/shared": ["../../packages/@ayech/shared/src"],
          "@ayech/shared/*": ["../../packages/@ayech/shared/src/*"],
        },
      },
      include: ["src/**/*.ts", "src/**/*.tsx", "manifest.ts"],
      exclude: ["node_modules", "dist"],
    };

    fs.writeJsonSync(path.join(moduleDir, "tsconfig.json"), tsconfig, {
      spaces: 2,
    });

    // ─── Generate Landing page ───
    const landingPage = `"use client";

import { Box } from "lucide-react";

export default function ${toPascalCase(answers.id)}Landing() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "${answers.color}20" }}
        >
          <Box className="w-5 h-5" style={{ color: "${answers.color}" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ${answers.name}
          </h1>
          <p className="text-sm text-slate-500">${answers.description}</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
        <p className="text-slate-400">
          Module content will be implemented here.
        </p>
      </div>
    </div>
  );
}
`;

    fs.writeFileSync(
      path.join(moduleDir, "src/pages/Landing.tsx"),
      landingPage
    );

    // ─── Generate index.ts ───
    fs.writeFileSync(
      path.join(moduleDir, "src/index.ts"),
      `export { default as manifest } from "../manifest";\n`
    );

    // ─── Generate locale files ───
    const localeTemplate = {
      module: {
        name: answers.name,
        description: answers.description,
      },
    };
    ["ar", "fr", "en"].forEach((lang) => {
      fs.writeJsonSync(
        path.join(moduleDir, `src/locales/${lang}.json`),
        localeTemplate,
        { spaces: 2 }
      );
    });

    // ─── Generate README ───
    const readme = `# @ayech/mod-${answers.id}

> ${answers.description}

## Module Info

| Property | Value |
|----------|-------|
| ID | \`mod-${answers.id}\` |
| Category | ${answers.category} |
| Tier | ${answers.tier} |
| Version | 1.0.0 |

## Installation

This module is auto-discovered by the Ayech AI kernel.
Install it from the Module Store at \`/store\`.

## Development

\`\`\`bash
# From monorepo root
pnpm dev
\`\`\`
`;

    fs.writeFileSync(path.join(moduleDir, "README.md"), readme);

    // ─── Generate .gitkeep files ───
    ["migrations", "tests", "src/services", "src/stores", "src/api", "src/hooks"].forEach(
      (dir) => {
        const gitkeepPath = path.join(moduleDir, dir, ".gitkeep");
        if (!fs.existsSync(gitkeepPath)) {
          fs.writeFileSync(gitkeepPath, "");
        }
      }
    );

    console.log(`\n✅ Module created successfully!`);
    console.log(`   📁 ${moduleDir}`);
    console.log(`\n   Files created:`);
    console.log(`   ├── manifest.ts`);
    console.log(`   ├── package.json`);
    console.log(`   ├── tsconfig.json`);
    console.log(`   ├── README.md`);
    console.log(`   ├── src/index.ts`);
    console.log(`   ├── src/pages/Landing.tsx`);
    console.log(`   ├── src/locales/{ar,fr,en}.json`);
    console.log(`   └── ... (directory structure)`);
    console.log(`\n   Next steps:`);
    console.log(`   1. Run: pnpm install`);
    console.log(`   2. Start dev: pnpm dev`);
    console.log(`   3. Visit /store to install your module`);
    console.log(`   4. Build out pages in src/pages/\n`);
  });

// ─── LIST COMMAND ───────────────────────────────────────────
program
  .command("list")
  .description("List all discovered modules")
  .action(() => {
    const modulesDir = path.resolve(__dirname, "../../modules/@ayech");

    if (!fs.existsSync(modulesDir)) {
      console.log("\n📦 No modules directory found.\n");
      return;
    }

    const modules = fs
      .readdirSync(modulesDir)
      .filter((dir) => {
        return fs.existsSync(path.join(modulesDir, dir, "manifest.ts"));
      });

    if (modules.length === 0) {
      console.log("\n📦 No modules found. Create one with: pnpm module:create\n");
      return;
    }

    console.log(`\n🧩 Discovered Modules (${modules.length}):\n`);
    modules.forEach((mod) => {
      const pkgPath = path.join(modulesDir, mod, "package.json");
      let version = "?";
      let description = "";
      if (fs.existsSync(pkgPath)) {
        const pkg = fs.readJsonSync(pkgPath);
        version = pkg.version || "?";
        description = pkg.description || "";
      }
      console.log(`   📦 ${mod} (v${version})`);
      if (description) console.log(`      ${description}`);
    });
    console.log("");
  });

program.parse();

// ─── Helpers ────────────────────────────────────────────────
function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
