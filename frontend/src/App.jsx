import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AVLTreeVisualizer from './AvlTree'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AVLApplication from './Application'

function App() {
 

  return (
  <>
  <BrowserRouter>
  <Routes>
      <Route path="/" element={<AVLTreeVisualizer />} />
        <Route path="/application" element={<AVLApplication />} />
    
  </Routes>
  </BrowserRouter>
  </>
  )
}

export default App
