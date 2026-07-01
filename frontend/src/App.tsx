import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { PrivateRoute } from './components/layout/PrivateRoute'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import CompanyPage from './pages/CompanyPage'
import LoginPage from './pages/LoginPage'
import RegisterUserPage from './pages/RegisterUserPage'
import RegisterCompanyPage from './pages/RegisterCompanyPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import MyOrdersPage from './pages/MyOrdersPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterUserPage />} />
            <Route path="/register/company" element={<RegisterCompanyPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/restaurants/:id"
              element={
                <PrivateRoute>
                  <RestaurantPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <MyOrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute>
                  <OrderTrackingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/company"
              element={
                <PrivateRoute>
                  <CompanyPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
