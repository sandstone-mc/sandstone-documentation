module.exports = {
  title: 'Sandstone',
  tagline: 'A Minecraft Datapack library in Typescript',
  url: 'https://www.sandstone.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'favicon.ico',
  organizationName: 'sandstone-mc', // Usually your GitHub org/user name.
  projectName: 'sandstone-documentation', // Usually your repo name.
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },
    navbar: {
      title: 'Sandstone',
      logo: {
        alt: 'Sandstone Logo',
        src: '/img/icons/logo.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'playground/',
          activeBasePath: 'playground',
          label: 'Playground',
          position: 'left',
        },
        {
          href: 'https://github.com/sandstone-mc/sandstone',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: require('prism-react-renderer/themes/vsDark'),
    },
  },
  plugins: [
    require.resolve('./src/plugins/custom-webpack'),
    require.resolve('./src/plugins/get-sandstone-files'),
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/sandstone-mc/sandstone-documentation/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
