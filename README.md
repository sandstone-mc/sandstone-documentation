[![Netlify Status](https://api.netlify.com/api/v1/badges/3dc217bc-43db-44b6-9244-b53fdd62e74e/deploy-status)](https://app.netlify.com/sites/silly-stonebraker-62b1a0/deploys)

# Website

This website is the documentation for the [Sandstone](https://github.com/TheMrZZ/) project. It is hosted on [sandstone.dev](https://www.sandstone.dev).

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
