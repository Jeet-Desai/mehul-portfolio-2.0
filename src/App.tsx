import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import Research from './pages/Research'
import LearnHub from './pages/LearnHub'
import Formulas from './pages/Formulas'
import CalculatorPage from './pages/CalculatorPage'
import Practice from './pages/Practice'
import Ask from './pages/Ask'
import CareerGuide from './pages/CareerGuide'
import NoticeBoard from './pages/NoticeBoard'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

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
          <Route path="/learn/c/:slug" element={<CalculatorPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/career" element={<CareerGuide />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
