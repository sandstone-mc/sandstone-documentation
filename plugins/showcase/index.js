const path = require("path");
const fs = require("fs");
const { normalizeUrl } = require("@docusaurus/utils");

const DATA_DIR = path.resolve(__dirname, "../../data/showcase");
const INDEX_PAGE_COMPONENT = path.resolve(
  __dirname,
  "../../src/components/Showcase/ShowcaseIndexPage.tsx"
);
const PROJECT_PAGE_COMPONENT = path.resolve(
  __dirname,
  "../../src/components/Showcase/ShowcaseProjectPage.tsx"
);

/**
 * @param {import("@docusaurus/types").LoadContext} context
 */
module.exports = function (context) {
  return {
    name: "showcase",

    async loadContent() {
      if (!fs.existsSync(DATA_DIR)) return { projects: [] };

      const files = fs
        .readdirSync(DATA_DIR)
        .filter((file) => file.endsWith(".json"));

      const projects = files.map((file) => {
        const project = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
        if (!project.slug || !project.title || !project.lastUpdated) {
          throw new Error(`[showcase] ${file} is missing a required "slug", "title", or "lastUpdated" field`);
        }
        return project;
      });

      projects.sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });

      return { projects };
    },

    async contentLoaded({ content, actions }) {
      const { projects } = content;
      const { addRoute, createData, setGlobalData } = actions;

      setGlobalData({ projects });

      const projectsDataPath = await createData(
        "showcase-projects.json",
        JSON.stringify(projects)
      );

      addRoute({
        path: normalizeUrl([context.baseUrl, "showcase"]),
        component: INDEX_PAGE_COMPONENT,
        exact: true,
        modules: { projects: projectsDataPath },
      });

      for (const project of projects) {
        const projectDataPath = await createData(
          `showcase-${project.slug}.json`,
          JSON.stringify(project)
        );

        addRoute({
          path: normalizeUrl([context.baseUrl, "showcase", project.slug]),
          component: PROJECT_PAGE_COMPONENT,
          exact: true,
          modules: { project: projectDataPath },
        });
      }
    },
  };
};
