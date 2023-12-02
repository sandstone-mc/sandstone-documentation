import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

console.log(require.resolve("./plugins/get-sandstone-files"))

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
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [require("./plugins/get-sandstone-files")],

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
    plugins: [
      require.resolve("./plugins/get-sandstone-files")
    ],
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
