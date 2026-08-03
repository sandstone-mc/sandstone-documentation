import Layout from '@theme/Layout'
import { SubmitForm } from '../components/Showcase/SubmitForm'
import showcaseStyles from '../components/Showcase/Showcase.module.css'

export default function ShowcaseSubmitPage() {
  return (
    <Layout title="Submit a Showcase Project" description="Generate JSON for a new Sandstone showcase entry." noIndex>
      <div className={showcaseStyles.page}>
        <header className={showcaseStyles.header}>
          <h1 className={showcaseStyles.headerTitle}>Submit a Showcase Project</h1>
          <p className={showcaseStyles.headerSubtitle}>
            Fill this out, then copy or download the JSON and send it to a Sandstone maintainer along with your image files.
          </p>
        </header>
        <main className={showcaseStyles.indexMain}>
          <SubmitForm />
        </main>
      </div>
    </Layout>
  )
}
