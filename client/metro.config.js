const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/**
 * @tanstack/react-query and @tanstack/query-core publish package.json "exports"
 * with an `import` condition pointing at build/modern/*.js, and no
 * `react-native` condition. Metro (Expo SDK 54) prefers `exports` over the
 * classic `"react-native": "src/index.ts"` field, then fails to resolve
 * relative `./useQueries.js` imports.
 *
 * Keep package-exports on for the rest of the graph. For these two packages
 * only, fall back to classic resolution so Metro uses the `react-native` field.
 *
 * @see https://docs.expo.dev/versions/latest/config/metro/#packagejsonexports
 * @see https://metrobundler.dev/docs/package-exports/#packageesm-incompatibilites
 */
const TANSTACK_QUERY_PACKAGES = [
  "@tanstack/react-query",
  "@tanstack/query-core",
];

function isTanstackQueryPackage(moduleName) {
  return TANSTACK_QUERY_PACKAGES.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`),
  );
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isTanstackQueryPackage(moduleName)) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
