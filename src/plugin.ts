import { IBfjOptions, streamify } from 'bfj';
import { createWriteStream } from 'fs';
import { createEncodeStream } from 'msgpack-lite';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { Compiler, Stats } from 'webpack';
import { createGzip } from 'zlib';

export const enum StatsFormat {
  Json = 'json',
  MsgPack = 'msgpack',
}

export interface IPluginOptions {
  /**
   * Filename to output.
   */
  file: string;

  /**
   * Whether to gzip the stats file. Defaults to true.
   */
  gzip: boolean;

  /**
   * Format of the stats output. Defaults to msgpack.
   */
  format: StatsFormat;

  /**
   * Options to pass to bfj, when using the "JSON" message format.
   */
  bfjOptions?: IBfjOptions;
}

const defaultFilename = (gzip: boolean, format: StatsFormat) => {
  let filename = 'stats';

  if (format === StatsFormat.MsgPack) {
    filename += '.msp';
  } else {
    filename += '.json';
  }

  if (gzip) {
    filename += '.gz';
  }

  return filename;
};

const writeToStream = (
  options: IPluginOptions,
  data: Stats.ToJsonOutput,
  stream: NodeJS.WritableStream,
) => {
  if (options.format === StatsFormat.MsgPack) {
    const encode = createEncodeStream();
    encode.pipe(stream);
    encode.write(data);
    encode.end();
  } else {
    const encode = streamify(data, {
      promises: 'ignore',
      buffers: 'ignore',
      maps: 'ignore',
      iterables: 'ignore',
      circular: 'ignore',
      ...options.bfjOptions,
    });

    encode.pipe(stream);
  }
};

/**
 * Default listener used in the compiler. Webpack 4 will have a callback
 * function, but webpack 3 doesn't provide one, so we use this.
 */
const defaultListener = (err?: Error) => {
  if (err) {
    // tslint:disable-next-line
    console.error(`Error in the ${BundleComparisonPlugin.name}: ${err.stack || err.message}`);
  }
};

/**
 * Plugin that writes stat information to the compilation output.
 */
export class BundleComparisonPlugin {
  private readonly options: IPluginOptions;

  constructor({
    gzip = true,
    format = StatsFormat.MsgPack,
    ...defaults
  }: Partial<IPluginOptions> = {}) {
    this.options = {
      gzip,
      format,
      file: defaultFilename(gzip, format),
      ...defaults,
    };
  }

  public apply(compiler: Compiler) {
    const handler = (stats: Stats, callback: (err?: Error) => void = defaultListener) => {
      const target = createWriteStream(resolve(compiler.outputPath, this.options.file));

      target
        .on('end', () => callback())
        .on('finish', () => callback())
        .on('error', callback);

      const jsonData = stats.toJson({
        source: false,
        chunkModules: false,
      });

      if (this.options.gzip) {
        const compressor = this.options.gzip ? createGzip() : new PassThrough();
        compressor.pipe(target);
        writeToStream(this.options, jsonData, compressor);
      } else {
        writeToStream(this.options, jsonData, target);
      }
    };

    if (compiler.hooks) {
      compiler.hooks.done.tapAsync(BundleComparisonPlugin.name, handler);
    } else {
      compiler.plugin('done', handler);
    }
  }
}
