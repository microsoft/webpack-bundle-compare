import { Stats } from 'webpack';

const anyPathSeparator = /\/|\\/;

/**
 * Replaces the loader path in an identifier.
 * '(<loader expression>!)?/path/to/module.js'
 */
export const replaceLoaderInIdentifier = (identifier?: string) => {
  if (!identifier) {
    return '';
  }

  const index = identifier.lastIndexOf('!');
  return index === -1 ? identifier : identifier.slice(index + 1);
};
/**
 * Normalizes an identifier so that it carries over time: removing the
 * hash from the end of concatenated module identifiers.
 */
export const normalizeIdentifier = (identifier?: string) =>
  identifier ? identifier.replace(/ [a-z0-9]+$/, '') : '';

/**
 * Normalizes an identifier so that it carries over time.
 */
const humanReadableIdentifier = (identifier: string) =>
  replaceLoaderInIdentifier(identifier).replace(/ [a-z0-9]+$/, '');

// tslint:disable-next-line
const cacheByArg = <T extends Function>(fn: T): T => {
  const cacheMap = new WeakMap<any, any>();
  const argCount = fn.length;
  return function(this: any) {
    let mapping: Map<any, any> | WeakMap<any, any> = cacheMap;
    for (let i = 0; i < argCount - 1; i++) {
      const next = arguments[i];
      if (mapping.has(next)) {
        mapping = mapping.get(next);
      } else {
        const newMap = new Map();
        mapping.set(next, newMap);
        mapping = newMap;
      }
    }

    const lastArg = arguments[argCount - 1];
    if (!mapping.has(lastArg)) {
      const value = fn.apply(this, arguments);
      mapping.set(lastArg, value);
      return value;
    }

    return mapping.get(lastArg);
  } as any;
};

/**
 * Returns the size of all chunks from the stats.
 */
export const getTotalChunkSize = cacheByArg((stats: Stats.ToJsonOutput) =>
  stats.chunks!.reduce((sum, chunk) => sum + chunk.size, 0),
);

/**
 * Returns the size of the entry chunk(s).
 */
export const getEntryChunkSize = cacheByArg((stats: Stats.ToJsonOutput) =>
  stats.chunks!.filter(c => c.entry).reduce((sum, chunk) => sum + chunk.size, 0),
);

/**
 * Bitfield of module types.
 */
export const enum ImportType {
  Unknown = 0,
  EsModule = 1 << 1,
  CommonJs = 1 << 2,
}

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

  /**
   * Type of the node module.
   */
  importType: ImportType;
}

/**
 * Tries to get the node module in the given identifier, returning null if
 * it's not a node module import.
 */
export const getNodeModuleFromIdentifier = (identifier: string): string | null => {
  const parts = replaceLoaderInIdentifier(identifier).split(anyPathSeparator);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] !== 'node_modules') {
      continue;
    }

    let packageName = parts[i + 1];
    if (packageName[0] === '@') {
      packageName += '/' + parts[i + 2];
    }

    return packageName;
  }

  return null;
};

const concatParents = new WeakMap<Stats.FnModules, Stats.FnModules>();

/**
 * Returns the concatenation parent in which the given module resides. Will
 * returnt he module itself if it's already top-level.
 */
export const getConcatenationParent = (m: Stats.FnModules): Stats.FnModules =>
  concatParents.get(m) || m;

/**
 * Get webpack modules, either globally ro in a single chunk.
 */
export const getWebpackModules = cacheByArg((stats: Stats.ToJsonOutput, filterToChunk?: number) => {
  const modules: Stats.FnModules[] = [];
  if (!stats.modules) {
    return modules;
  }

  for (const parent of stats.modules) {
    if (filterToChunk !== undefined && !parent.chunks.includes(filterToChunk)) {
      continue;
    }

    // If it has nested modules, it's a concatened chunk. Remove the
    // concatenation and only emit children.
    if (!parent.modules) {
      modules.push(parent);
      continue;
    }

    for (const child of parent.modules) {
      modules.push(child);
      concatParents.set(child, parent);
    }
  }

  return modules;
});

/**
 * Returns a mapping of normalized identifiers in the chunk to module data.
 */
export const getWebpackModulesMap = cacheByArg(
  (stats: Stats.ToJsonOutput, filterToChunk?: number) => {
    const mapping: { [identifier: string]: Stats.FnModules } = {};
    for (const m of getWebpackModules(stats, filterToChunk)) {
      mapping[normalizeIdentifier(m.identifier)] = m;
    }

    return mapping;
  },
);

/**
 * Gets the type of import of the given module.
 */
export const getImportType = (importedModule: Stats.FnModules) => {
  let flags = 0;
  for (const reason of getReasons(importedModule)) {
    if (reason.type) {
      flags |= reason.type.includes('cjs')
        ? ImportType.CommonJs
        : reason.type.includes('harmony')
        ? ImportType.EsModule
        : ImportType.Unknown;
    }
  }

  return flags;
};

/**
 * Returns the number of dependencies.
 */
export const getNodeModules = cacheByArg((stats: Stats.ToJsonOutput, inChunk?: number) => {
  const modules: { [key: string]: INodeModule } = {};

  for (const importedModule of getWebpackModules(stats, inChunk)) {
    const packageName = getNodeModuleFromIdentifier(importedModule.identifier);
    if (!packageName) {
      continue;
    }

    const moduleType = getImportType(importedModule);
    const previous = modules[packageName];
    if (!previous) {
      modules[packageName] = {
        name: packageName,
        totalSize: importedModule.size,
        modules: [importedModule],
        importType: moduleType,
      };
    } else {
      previous.totalSize += importedModule.size;
      previous.importType |= moduleType;
      previous.modules.push(importedModule);
    }
  }

  return modules;
});

/**
 * Types of importable modules.
 */
export const enum ModuleType {
  Javascript,
  Style,
  External,
  NodeModule,
}

/**
 * Identifies a module type, given an ID.
 */
export const identifyModuleType = (id: string): ModuleType => {
  if (id.includes('style-loader') || id.includes('css-loader')) {
    return ModuleType.Style;
  }

  if (id.startsWith('external ')) {
    return ModuleType.External;
  }

  if (id.includes('node_modules')) {
    return ModuleType.NodeModule;
  }

  return ModuleType.Javascript;
};

/**
 * Grouped output comparing an old and new node module.
 */
export interface IWebpackModuleComparisonOutput {
  identifier: string;
  readableId: string;
  name: string;
  type: ModuleType;
  fromSize: number;
  toSize: number;
  nodeModule?: string;
  old?: Stats.FnModules;
  new?: Stats.FnModules;
}

/**
 * Returns a grouped comparison of the old and new modules from the stats.
 */
export const compareAllModules = (
  oldStats: Stats.ToJsonOutput,
  newStats: Stats.ToJsonOutput,
  inChunk?: number,
) => {
  const oldModules = getWebpackModules(oldStats, inChunk);
  const newModules = getWebpackModules(newStats, inChunk);

  const output: { [name: string]: IWebpackModuleComparisonOutput } = {};
  for (const m of oldModules) {
    const normalized = normalizeIdentifier(m.identifier);
    output[normalized] = {
      identifier: normalized,
      readableId: humanReadableIdentifier(m.identifier),
      name: replaceLoaderInIdentifier(m.name),
      type: identifyModuleType(m.identifier),
      nodeModule: getNodeModuleFromIdentifier(m.identifier) || undefined,
      toSize: 0,
      fromSize: m.size,
      old: m,
    };
  }

  for (const m of newModules) {
    const normalized = normalizeIdentifier(m.identifier);
    if (output[normalized]) {
      output[normalized].new = m;
      output[normalized].toSize = m.size;
    } else {
      output[normalized] = {
        identifier: normalized,
        readableId: humanReadableIdentifier(m.identifier),
        name: replaceLoaderInIdentifier(m.name),
        type: identifyModuleType(m.identifier),
        nodeModule: getNodeModuleFromIdentifier(m.identifier) || undefined,
        fromSize: 0,
        toSize: m.size,
        new: m,
      };
    }
  }

  return output;
};

/**
 * Grouped output comparing an old and new node module.
 */
export interface INodeModuleComparisonOutput {
  name: string;
  old?: INodeModule;
  new?: INodeModule;
}

/**
 * Returns a grouped comparison of the old and new modules from the stats.
 */
export const compareNodeModules = (
  oldStats: Stats.ToJsonOutput,
  newStats: Stats.ToJsonOutput,
  inChunk?: number,
) => {
  const oldModules = getNodeModules(oldStats, inChunk);
  const newModules = getNodeModules(newStats, inChunk);

  const output: { [name: string]: INodeModuleComparisonOutput } = {};
  for (const name of Object.keys(oldModules)) {
    output[name] = { name, old: oldModules[name] };
  }

  for (const name of Object.keys(newModules)) {
    if (output[name]) {
      output[name].new = newModules[name];
    } else {
      output[name] = { name, new: oldModules[name] };
    }
  }

  return Object.values(output);
};

/**
 * Gets the number of node modules.
 */
export const getNodeModuleSize = cacheByArg((stats: Stats.ToJsonOutput, inChunk?: number) => {
  let total = 0;
  const modules = getNodeModules(stats, inChunk);
  for (const key of Object.keys(modules)) {
    total += modules[key].totalSize;
  }

  return total;
});

/**
 * Gets the number of node modules.
 */
export const getNodeModuleCount = (stats: Stats.ToJsonOutput, inChunk?: number) =>
  Object.keys(getNodeModules(stats, inChunk)).length;

/**
 * Gets the number of node modules.
 */
export const getTreeShakablePercent = cacheByArg((stats: Stats.ToJsonOutput, inChunk?: number) => {
  const modules = Object.values(getNodeModules(stats, inChunk));
  if (modules.length === 0) {
    return 1;
  }

  let harmony = 0;
  for (const { importType: moduleType } of modules) {
    if (moduleType & ImportType.EsModule && !(moduleType & ImportType.CommonJs)) {
      harmony++;
    }
  }

  return harmony / modules.length;
});

/**
 * Gets the number of node modules.
 */
export const getTotalModuleCount = (stats: Stats.ToJsonOutput, inChunk?: number) =>
  getWebpackModules(stats, inChunk)!.length;

/**
 * Gets the number of node modules.
 */
export const getAverageChunkSize = (stats: Stats.ToJsonOutput) => {
  let sum = 0;
  for (const chunk of stats.chunks!) {
    sum += chunk.size;
  }

  return sum / stats.chunks!.length;
};

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

/**
 * Gets the reasons that the module was imported. Fix for broken webpack typings here.
 */
export const getReasons = (m: Stats.FnModules): Stats.Reason[] => m.reasons as any;

/**
 * Gets all direct imports of the given node module.
 */
export const getDirectImportsOfNodeModule = (stats: Stats.ToJsonOutput, name: string) =>
  stats.modules!.filter(m => getNodeModuleFromIdentifier(m.name) === name);

/**
 * Gets all direct imports of the given node module.
 */
export const getImportersOfIdentifier = (
  stats: Stats.ToJsonOutput,
  identifier: string,
): Stats.FnModules[] => {
  const modules = getWebpackModulesMap(stats);
  const root = modules[normalizeIdentifier(identifier)];
  if (!root) {
    return [];
  }

  return getReasons(root)
    .map(reason => modules[normalizeIdentifier(reason.moduleIdentifier)])
    .filter(Boolean);
};
