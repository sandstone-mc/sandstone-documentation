import clsx from "clsx";
import styles from "./index.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

const features = [
  {
    title: "Easy to Use",
    imageUrl: '/img/icons/computer.png',
    style: styles.featureImage2,
    description: (
      <>
        Sandstone was designed to be easily installed, and used
        to create your first datapacks quickly.
      </>
    ),
  },
  {
    title: "Focus on What Matters",
    imageUrl: '/img/icons/dirt.png',
    style: styles.featureImage1,
    description: (
      <>
        Sandstone lets you focus on your logic, and takes care of the implementation.
        The familiar abstractions help you keep your head clear of all distractions.
      </>
    ),
  },
  {
    title: "Powered by Typescript",
    imageUrl: '/img/icons/ts.png',
    style: styles.featureImage3,
    description: (
      <>
        Typescript provides perfect autocompletion, prevents your errors
        before you even hit "run", and ensure your code is maintainable.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description, style }) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imageUrl && (
        <div className="text--center">
          <img className={style} src={imageUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} as any } = context;
  return (
    <Layout
      title={`${siteConfig.title} | A Typescript library for Minecraft Datapacks & Resource Packs`}
      description="Sandstone is a Typescript library used to create Minecraft datapacks & resource packs. Featuring perfect autocompletion, while &amp; for loops, shared configurable libraries..."
      
      // keywords={['sandstone', 'minecraft', 'datapack', 'typescript', 'easy']}
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
