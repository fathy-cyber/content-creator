/**
 * ModuleDiscovery — Handles the automatic discovery of modules in the filesystem.
 * 
 * In a Vite environment, we use import.meta.glob to find all manifest files.
 */

import type { ModuleManifest } from '../types/ModuleManifest';

export async function discoverModules(): Promise<ModuleManifest[]> {
  // Use Vite's glob import to find all manifest files in src/modules
  const modules = import.meta.glob('../../modules/**/manifest*.ts');
  
  const manifestsMap = new Map<string, ModuleManifest>();

  // Iterate through the discovered files and import them
  for (const path of Object.keys(modules)) {
    try {
      const module = await modules[path]();
      
      // Check for array of manifests first (e.g., ERP module with multiple sub-modules)
      const manifestsArray = Object.values(module).find(
        (val: any) => Array.isArray(val) && val.length > 0 && val[0] && 'id' in val[0] && 'name' in val[0]
      ) as ModuleManifest[];

      if (manifestsArray && Array.isArray(manifestsArray)) {
        for (const manifest of manifestsArray) {
          if (!manifestsMap.has(manifest.id)) {
            manifestsMap.set(manifest.id, manifest);
          }
        }
      } else {
        // Find a single exported manifest
        const manifest = Object.values(module).find(
          (val: any) => val && typeof val === 'object' && !Array.isArray(val) && 'id' in val && 'name' in val
        ) as ModuleManifest;

        if (manifest && !manifestsMap.has(manifest.id)) {
          manifestsMap.set(manifest.id, manifest);
        }
      }
    } catch (err) {
      console.error(`[ModuleDiscovery] Failed to load manifest at ${path}:`, err);
    }
  }

    try {
      const manifests = Array.from(manifestsMap.values());
      console.log(`[ModuleDiscovery] Discovered ${manifests.length} modules:`, manifests.map(m => m.id));
      return manifests;
    } catch (err) {
      console.error(`[ModuleDiscovery] Error finalizing discovered modules:`, err);
      return [];
    }
}
