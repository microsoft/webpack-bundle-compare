import { Stats } from 'webpack';

declare module 'webpack' {
  namespace Stats {
    // tslint:disable-next-line
    export interface Reason {
      moduleId: number;
      moduleIdentifier: string;
      module: string;
      name?: string;
      moduleName: string;
      type: string | null;
      loc: string;
      userRequest: string;
    }
  }
}
