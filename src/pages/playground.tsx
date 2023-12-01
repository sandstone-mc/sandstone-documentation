import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import './playground.module.css'

export default function Playground() {
  const context = useDocusaurusContext();
  const { siteConfig = {} as any } = context;

  return (
    <Layout
      title={`${siteConfig.title} | A Typescript library for Minecraft Datapacks & Resource Packs`}
      description="Sandstone is a Typescript library used to create Minecraft datapacks & resource packs. Featuring perfect autocompletion, while &amp; for loops, shared configurable libraries..."
      // keywords={['sandstone', 'minecraft', 'datapack', 'typescript', 'easy']}
      wrapperClassName="iframe-wrapper"
    >

        <iframe 
      src="https://stackblitz.com/edit/sandstone-example?view=editor&amp;embed=1&amp;file=src/greet.ts&amp;" 
      id="sandstone-playground" 
      height="100%" 
      width="100%" 
      // frameborder="0"
      style={{
        height: '100%',
        width: '100%',
        flexGrow: 1,
      }}
      >      
    </iframe>
    </Layout>
  )
}