import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import Research from './pages/Research'
import LearnHub from './pages/LearnHub'
import Formulas from './pages/Formulas'
import ResourceLibrary from './pages/ResourceLibrary'
import ResourceTopic from './pages/ResourceTopic'
import CalculatorPage from './pages/CalculatorPage'
import Practice from './pages/Practice'
import Progress from './pages/Progress'
import Revise from './pages/Revise'
import Ask from './pages/Ask'
import CareerGuide from './pages/CareerGuide'
import NoticeBoard from './pages/NoticeBoard'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/research" element={<Research />} />
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/formulas" element={<Formulas />} />
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route path="/resources/:id" element={<ResourceTopic />} />
          {/* Interactive tools require login (when auth is enabled); browse pages stay public for SEO. */}
          <Route path="/learn/c/:slug" element={<RequireAuth><CalculatorPage /></RequireAuth>} />
          <Route path="/practice" element={<RequireAuth><Practice /></RequireAuth>} />
          <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
          <Route path="/revise" element={<RequireAuth><Revise /></RequireAuth>} />
          <Route path="/ask" element={<RequireAuth><Ask /></RequireAuth>} />
          <Route path="/career" element={<CareerGuide />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
