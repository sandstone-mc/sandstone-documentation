import { usePluginData } from '@docusaurus/useGlobalData'
import { ProjectCard } from './ProjectCard'
import type { ShowcaseProject } from './types'

interface ProjectGridProps {
  projects?: ShowcaseProject[]
  limit?: number
  className?: string
}

export function ProjectGrid({ projects, limit, className }: ProjectGridProps) {
  const pluginData = usePluginData('showcase') as { projects: ShowcaseProject[] } | undefined
  const source = projects ?? pluginData?.projects ?? []
  const visible = limit ? source.slice(0, limit) : source

  return (
    <div className={className}>
      {visible.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  )
}
