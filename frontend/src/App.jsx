import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import SignUp from './pages/SignUp'
import Hero from './components/Hero'
import Contact from './pages/Contact'
import Login from './pages/Login'
import { UserProvider } from './context/UserContext'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Service from './pages/Service'
import { ServiceProvider } from './context/ServiceContext'

function App() {
  

  return (
  <BrowserRouter>
    <UserProvider>
      <ServiceProvider>

        <Routes>
          <Route>
            <Route path='/' element={<Layout/>}>
            <Route index element={<Home/>}/>
            <Route path='/about' element={<About/>}/>
            <Route path='/contact' element={<Contact/>}/>
            <Route path='/signup' element={<SignUp/>}/>
            <Route path='/hero' element={<Hero/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/forgot-password' element={<ForgotPassword/>}/>
            <Route path='/reset-password/:token' element={<ResetPassword/>}/>
            <Route path='/service' element={<Service/>}/>
            </Route>
          </Route>
        </Routes>
      </ServiceProvider>
    </UserProvider>
  </BrowserRouter>
  )
}

export default App
