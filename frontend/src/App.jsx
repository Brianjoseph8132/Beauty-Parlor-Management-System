import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import SignUp from './pages/SignUp'
import Hero from './components/Hero'
import Contact from './pages/Contact'
import Login from './pages/Login'
import { UserProvider } from './context/UserContext'

function App() {
  

  return (
  <BrowserRouter>
    <UserProvider>

      <Routes>
        <Route>
          <Route path='/' element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/hero' element={<Hero/>}/>
          <Route path='/login' element={<Login/>}/>
          </Route>
        </Route>
      </Routes>
      
    </UserProvider>
  </BrowserRouter>
  )
}

export default App
