import { Stats } from 'webpack';

const loaderRegex = /.*!/;
const anyPathSeparator = /\/|\\/;

/**
 * Replaces the loader path in an identifier.
 * '(<loader expression>!)?/path/to/module.js'
 */
const replaceLoaderInIdentifier = (identifier: string) => identifier.replace(loaderRegex, '');

/**
 * Normalizes an identifier so that it carries over time.
 */
const normalizeIdentifier = (identifier: string) =>
  replaceLoaderInIdentifier(identifier).replace(/ [a-z0-9]+$/, '');

const cacheByArg = <T extends Function>(fn: T): T => {
  const cacheMap = new WeakMap<any, any>();
  return function(this: any, arg: any) {
    if (!cacheMap.has(arg)) {
      const value = fn.apply(this, arguments);
      cacheMap.set(arg, value);
      return value;
    }

    return cacheMap.get(arg);
  } as any;
};

/**
 * Returns the size of all chunks from the stats.
 */
export const getTotalChunkSize = cacheByArg((stats: Stats.ToJsonOutput) =>
  stats.chunks!.reduce((sum, chunk) => sum + chunk.size, 0),
);

/**
 * Type containing metadata about an external node module.
 */
export interface INodeModule {
  /**
   * Friendly name of the dependency node.
   */
  name: string;

  /**
   * Total size of the node module in the stats.
   */
  totalSize: number;

  /**
   * Modules imported from this dependency.
   */
  modules: Stats.FnModules[];
}

/**
 * Returns the number of dependencies.
 */
export const getNodeModules = cacheByArg(
  (stats: Stats.ToJsonOutput): ReadonlyArray<INodeModule> => {
    const modules: { [key: string]: INodeModule } = {};

    for (const importedModule of stats.modules!) {
      const parts = replaceLoaderInIdentifier(importedModule.identifier).split(anyPathSeparator);
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i] !== 'node_modules') {
          continue;
        }

        let packageName = parts[i + 1];
        if (packageName[0] === '@') {
          packageName += '/' + parts[i + 2];
        }

        const previous = modules[packageName];
        if (!previous) {
          modules[packageName] = {
            name: packageName,
            totalSize: importedModule.size,
            modules: [importedModule],
          };
        } else {
          previous.totalSize += importedModule.size;
          previous.modules.push(importedModule);
        }
        break;
      }
    }

    return Object.values(modules);
  },
);

/**
 * Gets the number of node modules.
 */
export const getNodeModuleCount = (stats: Stats.ToJsonOutput) => getNodeModules(stats).length;

export interface IModuleTreeNode {
  /**
   * Module ID.
   */
  id: number;

  /**
   * Friendly module name.
   */
  name: string;

  /**
   * Module size
   */
  size: number;

  /**
   * List of children this module imports.
   */
  children: IModuleTreeNode[];
}

export const getModuleTree = cacheByArg(
  (stats: Stats.ToJsonOutput): IModuleTreeNode => {
    const building: IModuleTreeNode[] = stats.modules!.map(m => ({
      id: Number(m.id),
      name: m.name,
      size: m.size,
      children: [],
    }));

    const entries: IModuleTreeNode[] = [];
    for (const item of stats.modules!) {
      const self = building[Number(item.id)];
      const { reasons } = item as any;
      if (reasons.some((r: any) => r.type === 'single entry')) {
        entries.push(self);
      }

      for (const issuer of reasons) {
        if (issuer.moduleId !== null && !building[issuer.moduleId].children.includes(self)) {
          building[issuer.moduleId].children.push(self);
        }
      }
    }

    return {
      id: -1,
      name: 'compilation',
      size: entries.reduce((acc, e) => acc + e.size, 0),
      children: entries,
    };
  },
);

/**
 * Module that changed in the build.
 */
export interface IModuleDiffEntry {
  name: string;
  fromSize: number;
  toSize: number;
}

/**
 * Gets metadata about the size difference of all modules.
 */
export const getModulesDiff = (
  first: Stats.ToJsonOutput,
  last: Stats.ToJsonOutput,
): IModuleDiffEntry[] => {
  const moduleMap: { [id: string]: IModuleDiffEntry } = {};
  for (const m of first.modules!) {
    moduleMap[normalizeIdentifier(m.identifier)] = {
      name: replaceLoaderInIdentifier(m.name),
      fromSize: m.size,
      toSize: 0,
    };
  }

  const changed: IModuleDiffEntry[] = [];
  for (const m of last.modules!) {
    const id = normalizeIdentifier(m.identifier);
    const existing = moduleMap[id];
    if (existing) {
      existing.toSize = m.size;
    } else {
      moduleMap[id] = {
        name: replaceLoaderInIdentifier(m.name),
        fromSize: 0,
        toSize: m.size,
      };
    }
  }

  return changed.concat(Object.values(moduleMap));
};
