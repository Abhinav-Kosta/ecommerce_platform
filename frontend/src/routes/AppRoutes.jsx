import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AccountPage from "../pages/AccountPage";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import AdminRoute from "../components/AdminRoute";
import AdminProductsPage from "../pages/AdminProductsPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import MyOrdersPage from "../pages/MyOrdersPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />
        
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>


        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/my-orders/:orderId" element={<OrderDetailsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route
            path="/admin/products"
            element={<AdminProductsPage />}
          />
          <Route
            path="/admin/orders"
            element={<AdminOrdersPage />}
          />
          <Route
            path="/admin/orders/:orderId"
            element={<OrderDetailsPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;