import { MainLayout } from './components/templates'
import { HeroSection, LinkList } from './components/organisms'
import { Card } from './components/molecules'
import type { LinkItem } from './types'

const documentationLinks: LinkItem[] = [
  { href: 'https://vite.dev/', label: 'Explore Vite', icon: 'vite', external: true },
  { href: 'https://react.dev/', label: 'Learn more', icon: 'react', external: true },
]

const socialLinks: LinkItem[] = [
  { href: 'https://github.com/vitejs/vite', label: 'GitHub', icon: 'github', external: true },
  { href: 'https://chat.vite.dev/', label: 'Discord', icon: 'discord', external: true },
  { href: 'https://x.com/vite_js', label: 'X.com', icon: 'x', external: true },
  { href: 'https://bsky.app/profile/vite.dev', label: 'Bluesky', icon: 'bluesky', external: true },
]

function App() {
  return (
    <MainLayout>
      <HeroSection />
      
      <div className="ticks" />
      
      <section className="main-layout__links" id="next-steps">
        <Card variant="default" padding="none" className="main-layout__card">
          <LinkList title="Documentation" icon="documentation" links={documentationLinks} />
        </Card>
        
        <Card variant="default" padding="none" className="main-layout__card">
          <LinkList title="Connect with us" icon="social" links={socialLinks} />
        </Card>
      </section>
      
      <div className="ticks" />
      <section id="spacer" />
    </MainLayout>
  )
}

export default App
