import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Production from './pages/Production'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import NotFound from './pages/NotFound'

/**
 * Root routing.
 *
 * "/" and "/production" both render the Production page (the dark
 * Portfolio-card design). The editorial paper page (src/pages/Home.tsx) is
 * deliberately NOT the front door — visitors used to land on it by mistake —
 * but it now serves as the written About/story page at "/about" (bio,
 * experience, capabilities).
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Production />} />
        <Route path="/production" element={<Production />} />
        <Route path="/about" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
