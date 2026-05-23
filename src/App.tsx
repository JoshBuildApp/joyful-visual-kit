import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Production from './pages/Production'
import Gallery from './pages/Gallery'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/production" element={<Production />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}