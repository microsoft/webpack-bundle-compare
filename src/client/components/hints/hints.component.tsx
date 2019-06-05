import * as React from 'react';

export const TreeShakeHint: React.FC = () => (
  <>
    <h2>Tree Shaking</h2>
    <p>
      Tree shaking eliminates dead code by only importing the code you use from modules. You want to
      choose (and build) dependencies that can be tree shaken to avoid having to deliver more code.
      Google/Chrome{' '}
      <a
        href="https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking/"
        target="_blank"
      >
        has a great article
      </a>{' '}
      pertaining to tree shaking in general, and the Webpack documentation publishes{' '}
      <a href="https://webpack.js.org/guides/tree-shaking/" target="_blank">
        some further guidance
      </a>
      .
    </p>

    <h3>tl;dr</h3>

    <ul>
      <li>
        If you import a module, check{' '}
        <a href="https://bundlephobia.com/" target="_blank">
          on Bundlephobia
        </a>{' '}
        to see if it's tree-shakable. Shakable modules will have a green leaf icon below their name.
      </li>
      <li>
        If you author a module, make sure you publish a build that uses ES modules. Also, add the{' '}
        <code>sideEffects: false</code> flag into your <code>package.json</code>.
      </li>
    </ul>
  </>
);

export const WhatIsAnEntrypoint: React.FC = () => (
  <>
    <h2>Entrypoints</h2>
    <p>
      An entrypoint is the first JavaScript that's loaded when a user navigates to your website.
      This is the bundle that needs to be downloaded before any of your own code in Webpack actually
      runs. You still might need to load more data, such as a route, before you show anything
      meaningful. You should try to keep your entrypoint size as small as possible to reduce your
      time to{' '}
      <a
        href="https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint"
        target="_blank"
      >
        time to first meaningful paint
      </a>
      .
    </p>
  </>
);

export const AverageChunkSize: React.FC = () => (
  <>
    <h2>Chunks and Sizes</h2>
    <p>
      A chunk is one bundle of code downloaded by webpack. You should make use of the available{' '}
      <a href="https://webpack.js.org/guides/lazy-loading/" target="_blank">
        lazy loading
      </a>{' '}
      tools available to you--such as{' '}
      <a href="https://reactjs.org/docs/code-splitting.html" target="_blank">
        React.lazy
      </a>
      , for instance--in order to have small, modular bundles. Loading only the code you need keeps
      your website fast and responsive. The{' '}
      <a
        href="https://developers.google.com/web/updates/2017/04/devtools-release-notes#coverage"
        target="_blank"
      >
        Chrome code coverage tool
      </a>{' '}
      can help you find sections of your code which are good candidates for code splitting.
    </p>
  </>
);

export const TotalModules: React.FC = () => (
  <>
    <h2>Total Modules</h2>
    <p>
      The total modules is a count of the number of source files that Webpack read in your build. It
      does not directly have an effect on your output, but is a rough measure of complexity and
      monolithism.
    </p>
  </>
);

export const UniqueEntrypoints: React.FC = () => (
  <>
    <h2>Unique Entrypoints</h2>
    <p>
      This is the number of different files that your code requires from the module. Usually you
      want to only import the file by its entrypoint, and allow tree shaking to prune unneeded code.
      What you should pay careful attention to here is making sure that you don't accidentally
      include multiple versions of the same dependency. This can easily happen if you have a
      dependency depends on a different version of this module that another one.
    </p>
  </>
);

export const DependentModules: React.FC = () => (
  <>
    <h2>Dependent Modules</h2>
    <p>
      This is the number of files, in your code or other dependency, that depend on this module. This number lets you easily see if you added or reduced coupling on this dependency.
    </p>
  </>
);

export const TotalNodeModuleSize: React.FC = () => (
  <>
    <h2>Total Module Size</h2>
    <p>
      This is how much filesize this module contributes to your code. This may differ from the
      Bundlephobia number shown on the page, for a few reasons:
      <ol>
        <li>The number here takes into account your unique tree-shaking graph.</li>
        <li>
          If you import a submodule from this dependency, it will not appear in Bundlephobia's
          analysis.
        </li>
        <li>
          Bundlephobia may not include certain processing that your custom webpack configuration
          applies.
        </li>
      </ol>
      <p>
        The number shown here is the accurate, precise filesize that this dependency contributes to
        your bundle.
      </p>
    </p>
  </>
);
