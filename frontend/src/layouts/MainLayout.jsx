import { useNavigate, Outlet, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Badge,
} from "@mui/material";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function MainLayout() {
  const { user, loading, logout } = useAuth();
  const { cartItemCount } = useCart();

  const navigate = useNavigate();
  
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            ShopEase
          </Typography>

          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/products">
            Products
          </Button>

          <IconButton
            color="inherit"
            aria-label={`Shopping cart with ${cartItemCount} items`}
            component={RouterLink}
            to="/cart"
          >
            <Badge
              badgeContent={cartItemCount}
              color="error"
              showZero={false}
            >
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

          {!loading && !user && (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </>
          )}
          {!loading && user && (
            <>
              {user.role === "admin" ? (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/products"
                  >
                    Products Management
                  </Button>
              
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/orders"
                  >
                    Order Management
                  </Button>
                </>
              ) : (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/my-orders"
                >
                  My Orders
                </Button>
              )}
          
              <Button
                color="inherit"
                onClick={async () => {
                  try {
                    await logout();
                  } catch (error) {
                    console.error("Logout failed:", error);
                  } finally {
                    navigate("/");
                  }
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default MainLayout;