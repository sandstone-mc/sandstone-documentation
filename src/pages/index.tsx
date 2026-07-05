import { ReactElement } from "react";
import styles from "./index.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { InteractiveSnippet, PatternShowcase, Button, Panel, CommandHint, type PatternDemo } from "../components";
import { useGithubStars } from "../hooks/useGithubStars";

const GITHUB_REPO = "sandstone-mc/sandstone";
const DISCORD_INVITE = "https://discord.gg/4tzM5aXDRe";

const heroDemoCode = `MCFunction('welcome', () => {
  say('Welcome to Sandstone!')
  give('@a', 'minecraft:diamond', 64)
  effect.give('@a', 'minecraft:speed', 30, 1)
})`;

const installCommand = "bun i -g sandstone-cli";

const mixingResourcesCode = `Advancement('my_advancement', {
    criteria: {
        tick: {
            trigger: 'minecraft:tick'
        }
    },
    rewards: {
        function: MCFunction('my_cool_reward', () => {
            say("You did it!")
        })
    }
})
`

const hitDetectionCode = `interface HitboxOptions {
  type?: string
  width?: number
  height?: number
  onHit: () => void
}

function checkHit(opts: HitboxOptions) {
  const w = opts.width ?? 0.9
  const h = opts.height ?? 2.0
  const type = opts.type ?? '#minecraft:skeletons'

  execute.positioned(rel(-w, -h / 2, -w)).run(() => {
    execute.as(Selector('@e', {
      type,
      dx: w * 2,
      dy: h,
      dz: w * 2
    })).if.entity('@s').run(() => {
      opts.onHit()
    })
  })
}


// Usage
MCFunction('check_sword_swing', () => {
  checkHit({
    width: 1.2,
    height: 2,
    onHit: () => {
      say('Hit detected!')
      effect.give('@s', 'minecraft:glowing', 3, 0)
    }
  })
})`;

const statusEffectCode = `interface StatusEffectOptions {
  name: string
  duration: number
  onApply?: () => void
  onTick?: () => void
  onEnd?: () => void
}

function createStatusEffect(opts: StatusEffectOptions) {
  const statusTag = Label(\`status.\${opts.name}\`)
  const statusTime = Objective.create(\`status.\${opts.name}_timer\`)

  const apply = MCFunction(\`status/\${opts.name}/apply\`, () => {
    statusTime('@s').set(opts.duration)
    statusTag('@s').add()
    opts.onApply?.()
  })

  const end = MCFunction(\`status/\${opts.name}/end\`, () => {
    statusTime('@s').reset()
    statusTag('@s').remove()
    opts.onEnd?.()
  })

  MCFunction(\`status/\${opts.name}/update\`, () => {
    execute.as(Selector('@e', { tag: statusTag })).at('@s').run(() => {
      opts.onTick?.()

      _.if(statusTime('@s').lessThanOrEqualTo(0), () => end())

      statusTime('@s').remove(1)
    })
  }, { runEveryTick: true })

  return { apply, end }
}

// Usage
const burning = createStatusEffect({
  name: 'burning',
  duration: 100,
  onTick: () => particle('flame', rel(0, 1, 0), abs(0.1, 0.25, 0.1), 0.01, 5, 'force'),
})

MCFunction('ignite_target', () => {
  burning.apply()
})`;

const patternDemos: PatternDemo[] = [
  {
    title: "Hit Detection",
    filename: "hit-detection.ts",
    description: (
      <>
        An options object plus a closure, reused anywhere you need a hitbox check.
      </>
    ),
    code: hitDetectionCode,
    generatedFiles: [
      {
        name: "check_sword_swing.mcfunction",
        content: `execute positioned ~-1.2 ~-1 ~-1.2 run function default:check_sword_swing/execute_positioned`,
      },
      {
        name: "check_sword_swing/execute_positioned.mcfunction",
        content: `execute as @e[type=#minecraft:skeletons, dx=2.4, dy=2, dz=2.4] if entity @s run function default:check_sword_swing/execute_positioned/execute_as`,
      },
      {
        name: "check_sword_swing/execute_positioned/execute_as.mcfunction",
        content: `say Hit detected!\neffect give @s minecraft:glowing 3 0`,
      },
    ],
  },
  {
    title: "Status Effects",
    filename: "status-effect.ts",
    description: (
      <>
        A factory function that returns a bundle of related functions, a
        lightweight take on OOP without a single class in sight.
      </>
    ),
    code: statusEffectCode,
    generatedFiles: [
      {
        name: "ignite_target.mcfunction",
        content: `function default:status/burning/apply`,
      },
      {
        name: "status/burning/apply.mcfunction",
        content: `scoreboard players set @s default.status.burning_timer 100\ntag @s add default.status.burning`,
      },
      {
        name: "status/burning/update.mcfunction",
        content: `execute as @e[tag=default.status.burning] at @s run function default:status/burning/update/execute_as`,
      },
      {
        name: "status/burning/update/execute_as.mcfunction",
        content: `particle flame ~ ~1 ~ 0.1 0.25 0.1 0.01 5 force\nexecute if score @s default.status.burning_timer matches ..0 run function default:status/burning/end\nscoreboard players remove @s default.status.burning_timer 1`,
      },
      {
        name: "status/burning/end.mcfunction",
        content: `scoreboard players reset @s default.status.burning_timer\ntag @s remove default.status.burning`,
      },
    ],
  },
  {
    title: "Mixing Resources",
    filename: "my_advancement.ts",
    description: (
      <></>
    ),
    code: mixingResourcesCode,
    generatedFiles: [
      {
        name: "my_advancement.json",
        content: `{
    "criteria": {
        "tick": {
            "trigger": "minecraft:tick"
        }
    },
    "rewards": {
        "function": "default:my_cool_reward"
    }
}`
      },
      {
        name: "my_cool_reward.mcfunction",
        content: `say You did it!`
      }
    ]
  }
];

interface Feature {
  title: string;
  imageUrl: string;
  description: ReactElement;
}

const features: Feature[] = [
  {
    title: "Perfect Autocompletion",
    imageUrl: "/img/icons/command_block.png",
    description: (
      <>
        Sandstone tells you what a command expects, and autocompletes complicated
        arguments for you. It works for every resource: commands, predicates,
        loot tables, advancements, and more.
      </>
    ),
  },
  {
    title: "Organize Resources Your Way",
    imageUrl: "/img/icons/book.png",
    description: (
      <>
        Pack multiple functions, advancements, or loot tables into a single file,
        or mirror vanilla's one-per-file layout. You get comments, indentation,
        and every other benefit of a real programming language.
      </>
    ),
  },
  {
    title: "Optimized Abstractions",
    imageUrl: "/img/icons/redstone.png",
    description: (
      <>
        If/else, boolean logic, while and for loops, sleep. All built in,
        and tuned to compile to faster code than most hand-written functions.
        Drop down to vanilla commands any time you want.
      </>
    ),
  },
  {
    title: "Share on NPM",
    imageUrl: "/img/icons/bundle.png",
    description: (
      <>
        Publish your functions to NPM and let anyone install them into their own
        packs. Raycasting, better tellraw, whole libraries, you can finally stop reinventing the wheel.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }: Feature) {
  return (
    <Panel className={styles.feature}>
      <div className={styles.featureHeader}>
        <div className={styles.featureIconSlot}>
          <img className={styles.featureIcon} src={imageUrl} alt={title} />
        </div>
        <h3 className={styles.featureTitle}>{title}</h3>
      </div>
      <p className={styles.featureDescription}>{description}</p>
    </Panel>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} as any } = context;

  const stars = useGithubStars(GITHUB_REPO);

  return (
    <Layout
      title={`${siteConfig.title} | A Typescript library for Minecraft Datapacks & Resource Packs`}
      description="Sandstone is a Typescript library used to create Minecraft datapacks & resource packs. Featuring perfect autocompletion, while &amp; for loops, shared configurable libraries..."
    >
      <div className={styles.page}>
        <header className={styles.heroBanner}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
              <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
              <div className={styles.buttons}>
                <Button variant="primary" to={useBaseUrl("docs/")}>
                  Get Started
                </Button>
                <Button variant="secondary" href="https://github.com/sandstone-mc/sandstone">
                  GitHub
                </Button>
              </div>
              <CommandHint command={installCommand} />
              <Link className={styles.quickstartLink} to={useBaseUrl("quickstart")}>
                New to Sandstone? Follow the quickstart &rarr;
              </Link>
            </div>
            <Panel className={styles.demoPanel}>
              <div className={styles.demoPanelHeader}>
                <span className={styles.demoPanelDot} />
                Try it live, edit the code
              </div>
              <InteractiveSnippet height={140} code={heroDemoCode} />
            </Panel>
          </div>
        </header>
        <main>
          <section className={styles.features}>
            <h2 className={styles.sectionHeading}>Why Sandstone</h2>
            <div className={styles.featureGrid}>
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </section>
          <section className={styles.patterns}>
            <h2 className={styles.sectionHeading}>Real Patterns From Real Packs</h2>
            <p className={styles.patternsIntro}>
              Adapted from the Sandstone booth at Summit 2026. Pick a pattern, then flip
              between the TypeScript and the functions it compiles to.
            </p>
            <PatternShowcase demos={patternDemos} />
          </section>
          <section className={styles.ctaSection}>
            <Panel className={styles.ctaPanel}>
              <h2 className={styles.ctaTitle}>Ready to build your datapack?</h2>
              <p className={styles.ctaSubtitle}>
                Jump into the docs and write your first Sandstone function in minutes.
              </p>
              <Button variant="primary" to={useBaseUrl("docs/")}>
                Get Started
              </Button>

              <p className={styles.ctaSubtitle}>
                - or -
              </p>

              <div className={styles.communityRow}>
                <Button
                  variant="secondary"
                  size="sm"
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Star on GitHub{stars != null ? ` (${stars.toLocaleString()})` : ""}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join the Discord
                </Button>
              </div>
            </Panel>
          </section>
        </main>
      </div>
    </Layout>
  );
}

export default Home;
