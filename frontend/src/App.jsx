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
import Booking from './pages/Booking'
import { BookingProvider } from './context/BookingContext'
import Thanks from './pages/Thanks'
import AppointmentHistory from './pages/AppointmentHistory'
import Profile from './pages/Profile'
import { EmployeeProvider } from './context/EmployeeContext'
import AppointmentReminder from './components/AppointmentReminder'
import SingleService from './pages/SingleService'
import ServiceManagement from './pages/ServiceManagement'
import BeauticianProfile from './pages/BeauticianProfile'

function App() {
  

  return (
  <BrowserRouter>
    <UserProvider>
      <ServiceProvider>
        <BookingProvider>
          <EmployeeProvider>

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
                <Route path='/book' element={<Booking/>}/>
                <Route path='/booking-success' element={<Thanks/>}/>
                <Route path='/history' element={<AppointmentHistory/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/reminder' element={<AppointmentReminder/>}/>
                <Route path='/single/:id' element={<SingleService/>}/>
                <Route path='/service-management' element={<ServiceManagement/>}/>
                <Route path='/beauticianprofile' element={<BeauticianProfile/>}/>
                </Route>
              </Route>
            </Routes>

          </EmployeeProvider>
        </BookingProvider>
      </ServiceProvider>
    </UserProvider>
  </BrowserRouter>
  )
}

export default App
