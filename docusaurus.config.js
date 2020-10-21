module.exports = {
  title: 'Sandstone',
  tagline: 'A Minecraft Datapack library in Typescript',
  url: 'https://www.sandstone.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'favicon.ico',
  organizationName: 'TheMrZZ', // Usually your GitHub org/user name.
  projectName: 'sandstone-documentation', // Usually your repo name.
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },
    navbar: {
      title: 'Sandstone',
      logo: {
        alt: 'Sandstone Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/TheMrZZ/sandstone',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: require('prism-react-renderer/themes/vsDark'),
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'start/intro',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/TheMrZZ/sandstone-documentation/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
