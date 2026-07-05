import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Button, Panel, CommandHint } from "../components";
import homeStyles from "./index.module.css";
import styles from "./quickstart.module.css";

interface Step {
  title: string;
  description: string;
  command: string;
}

const steps: Step[] = [
  {
    title: "Install the CLI",
    description: "Sandstone ships its own CLI for scaffolding and building packs.",
    command: "bun i -g sandstone-cli",
  },
  {
    title: "Create a project",
    description:
      "Scaffolds a new pack from the official template and walks you through picking a Sandstone version, a save location, and a package manager.",
    command: "sand create my-datapack",
  },
  {
    title: "Start the watcher",
    description:
      "Builds your pack and rebuilds it automatically every time you save a file.",
    command: "cd my-datapack && bun dev:watch",
  },
];

function Quickstart() {
  return (
    <Layout
      title="Quickstart"
      description="Install sandstone-cli, scaffold a project, and start building Minecraft datapacks with Sandstone in three steps."
    >
      <div className={homeStyles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Get Started in 3 Steps</h1>
          <p className={styles.subtitle}>
            From nothing to a live-rebuilding datapack, using the Sandstone CLI.
          </p>
        </header>
        <div className={styles.steps}>
          {steps.map((step, i) => (
            <Panel key={step.title} className={styles.step}>
              <div className={styles.stepBadge}>{i + 1}</div>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepDescription}>{step.description}</p>
                <CommandHint command={step.command} />
              </div>
            </Panel>
          ))}
        </div>
        <div className={styles.footer}>
          <Button variant="primary" to={useBaseUrl("docs/")}>
            Explore the Docs
          </Button>
          <Button variant="secondary" to={useBaseUrl("/")}>
            Back Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default Quickstart;
