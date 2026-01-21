import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Test from './pages/Test'
import { Toaster } from 'react-hot-toast'
import Verify from './pages/Verify'
import UserDashboard from './pages/UserDashboard'
import UserManagement from './pages/UserManagement'

function App() {

  return (
    <>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path='/' element={""}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/test' element={<Test/>}/>
          <Route path='/verify/:token' element={<Verify/>}/>
          <Route path='/admindash' element={<UserManagement/>}/>
          <Route path='/userdash' element={<UserDashboard/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
