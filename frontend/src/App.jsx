import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AVLTreeVisualizer from './AvlTree'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AVLApplication from './Application'
import AutoSuggestSearch from './Song'

function App() {
 

  return (
  <>
  <BrowserRouter>
  <Routes>
      <Route path="/" element={<AVLTreeVisualizer />} />
        <Route path="/application" element={<AVLApplication />} />
        <Route path="/song" element={<AutoSuggestSearch />} />
    
  </Routes>
  </BrowserRouter>
  </>
  )
}

export default App
