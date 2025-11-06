import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import { Contact } from 'lucide-react'
import SignUp from './pages/SignUp'
import Hero from './components/Hero'

function App() {
  

  return (
  <BrowserRouter>
  <Routes>
    <Route>
      <Route path='/' element={<Layout/>}>
      <Route index element={<Home/>}/>
      <Route path='/about' element={<About/>}/>
      <Route path='/contact' element={<Contact/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/hero' element={<Hero/>}/>
      </Route>
    </Route>
  </Routes>
  </BrowserRouter>
  )
}

export default App
