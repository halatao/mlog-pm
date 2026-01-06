import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ModalProvider } from './components/modals/ModalContext'
import Providers from './Providers'
import ProjectDetailPage from './pages/ProjectDetailPage'
import MilestoneDetailPage from './pages/MilestoneDetailPage'
import MonthlyOverviewPage from './pages/MonthlyOverviewPage'
import MyProjectsPage from './pages/MyProjectsPage'
import useTexts from './hooks/useTexts'
import HomePreview from './components/HomePreview'
import './styles/theme.css'

export default function App() {
  const texts = useTexts()
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch (e) {
      console.debug('Failed to init theme:', e)
    }
  }, [])

  return (
    <ModalProvider>
      <Providers>
        <BrowserRouter>
          <header className="tp-card tp-text p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <h1 className="text-lg font-semibold">{texts.general.appTitle}</h1>
              <div className="flex items-center gap-4">
                <nav className="text-sm tp-muted">
                  <Link className="px-2" to="/">{texts.general.nav.home}</Link>
                  <Link className="px-2" to="/overview/2025/12">{texts.general.nav.overview}</Link>
                  <Link className="px-2" to="/users/1/projects">{texts.general.nav.myProjects}</Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<HomePreview />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/projects/:projectId/milestones/:milestoneId" element={<MilestoneDetailPage />} />
              <Route path="/overview/:year/:month" element={<MonthlyOverviewPage />} />
              <Route path="/users/:userId/projects" element={<MyProjectsPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </Providers>
    </ModalProvider>
  )
}
