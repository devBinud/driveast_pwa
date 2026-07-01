import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { ScrollToTop } from '../components/common/ScrollToTop/ScrollToTop'

// Pages
import { Login } from '../pages/auth/Login'
import { ForgotPassword } from '../pages/auth/ForgotPassword'
import { Home } from '../pages/home/Home'
import { Requests } from '../pages/requests/Requests'
import { RequestDetails } from '../pages/requests/RequestDetails'
import { Trips } from '../pages/trips/Trips'
import { AssignedTrip } from '../pages/trips/AssignedTrip'
import { OTPVerification } from '../pages/trips/OTPVerification'
import { ActiveTrip } from '../pages/trips/ActiveTrip'
import { Payment } from '../pages/trips/Payment'
import { TripCompleted } from '../pages/trips/TripCompleted'
import { Profile } from '../pages/profile/Profile'

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth Group */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main Application Group */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:id" element={<RequestDetails />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/assigned" element={<AssignedTrip />} />
          <Route path="/trips/otp" element={<OTPVerification />} />
          <Route path="/trips/active" element={<ActiveTrip />} />
          <Route path="/trips/payment" element={<Payment />} />
          <Route path="/trips/completed" element={<TripCompleted />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
export default AppRoutes
