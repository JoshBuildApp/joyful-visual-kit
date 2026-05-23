import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Production from './pages/Production'
import Gallery from './pages/Gallery'
import NotFound from './pages/NotFound'

/**
 * Root routing.
 *
 * "/" and "/production" both render the Production page (the dark
 * Portfolio-card design). The legacy editorial paper Home page lives in
 * src/pages/Home.tsx on disk but is no longer routed — it was the "old
 * design" that visitors were landing on by mistake.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Production />} />
        <Route path="/production" element={<Production />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
