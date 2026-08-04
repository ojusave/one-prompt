import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

/**
 * Shared package emits extensionless ESM imports. Remotion's webpack
 * fullySpecified mode fails on those; disable for workspace packages.
 */
Config.overrideWebpackConfig((config) => {
  const rules = (config.module?.rules ?? []).map((rule: unknown) => {
    if (rule && typeof rule === "object" && "resolve" in rule) {
      const r = rule as { resolve?: Record<string, unknown> };
      return {
        ...r,
        resolve: {
          ...r.resolve,
          fullySpecified: false,
        },
      };
    }
    return rule;
  });

  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...rules,
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    resolve: {
      ...config.resolve,
      fullySpecified: false,
      extensionAlias: {
        ".js": [".ts", ".tsx", ".js"],
      },
    },
  };
});
