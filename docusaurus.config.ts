import { resolve, join } from "pathe";
import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

console.log(require.resolve("./plugins/get-sandstone-files"))

// In dev mode, resolve sandstone from local workspace build
const useLocalSandstone = process.env.NODE_ENV === "development";

// Build alias map for local sandstone
const localSandstoneDist = resolve(__dirname, "../sandstone/dist");
const localSandstoneAlias = {
  "sandstone$": join(localSandstoneDist, "index.js"),
  "sandstone/arguments": join(localSandstoneDist, "arguments/index.js"),
  "sandstone/commands": join(localSandstoneDist, "commands/index.js"),
  "sandstone/core": join(localSandstoneDist, "core/index.js"),
  "sandstone/flow": join(localSandstoneDist, "flow/index.js"),
  "sandstone/pack": join(localSandstoneDist, "pack/index.js"),
  "sandstone/variables": join(localSandstoneDist, "variables/index.js"),
};

if (useLocalSandstone) {
  console.log("Using local sandstone build from", localSandstoneDist);
}

const config: Config = {
  title: "Sandstone",
  tagline: "A Minecraft Datapack library in Typescript",
  favicon: "favicon.ico",

  // Set the production url of your site here
  url: "https://www.sandstone.dev",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "sandstone-mc", // Usually your GitHub org/user name.
  projectName: "sandstone-documentation", // Usually your repo name.

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    require("./plugins/get-sandstone-files"),
    ...(useLocalSandstone
      ? [[require("./plugins/local-sandstone-alias"), { alias: localSandstoneAlias }]]
      : []),
  ],

  presets: [
    [
      "classic",
      {
        googleAnalytics: {
          trackingID: "UA-168678555-1",
          anonymizeIP: true,
        },
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          remarkPlugins: [require("./plugins/preserve-code-whitespace")],
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
    },
    metadata: [
      {
        keywords: "sandstone, minecraft, datapack, typescript, easy",
      },
    ],
    // k
    // metadata: {
    //   keywords: [
    //     "sandstone",
    //     "minecraft",
    //     "datapack",
    //     "typescript",
    //     "easy",
    //   ].join(", "),
    // },
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Sandstone",
      logo: {
        alt: "Sandstone Logo",
        src: "img/icons/logo.png",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        {
          to: "playground/",
          activeBasePath: "playground",
          label: "Playground",
          position: "left",
        },
        {
          href: "https://github.com/sandstone-mc/sandstone",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    // footer: {
    //   style: "dark",
    //   links: [
    //     {
    //       title: "Docs",
    //       items: [
    //         {
    //           label: "Tutorial",
    //           to: "/docs/intro",
    //         },
    //       ],
    //     },
    //     {
    //       title: "Community",
    //       items: [
    //         {
    //           label: "Stack Overflow",
    //           href: "https://stackoverflow.com/questions/tagged/docusaurus",
    //         },
    //         {
    //           label: "Discord",
    //           href: "https://discordapp.com/invite/docusaurus",
    //         },
    //         {
    //           label: "Twitter",
    //           href: "https://twitter.com/docusaurus",
    //         },
    //       ],
    //     },
    //     {
    //       title: "More",
    //       items: [
    //         {
    //           label: "Blog",
    //           to: "/blog",
    //         },
    //         {
    //           label: "GitHub",
    //           href: "https://github.com/facebook/docusaurus",
    //         },
    //       ],
    //     },
    //   ],
    //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    // },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
