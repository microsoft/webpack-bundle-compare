import { Stats } from 'webpack';

declare module 'webpack' {
  namespace Stats {
    // tslint:disable-next-line
    export interface Reason {
      moduleId: number;
      moduleIdentifier: string;
      module: string;
      moduleName: string;
      type: string;
      loc: string;
      userRequest: string;
    }
  }
}
