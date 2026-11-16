import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link,
} from "@mui/material";

import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginUser } from "../api/authApi";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";

function LoginPage() {

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { setUser } = useAuth();

  const navigate = useNavigate();
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await loginUser(data);

      setUser(response.data.user);
      setSuccessMessage("Login successful!");
      navigate("/");
      
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 6,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Welcome Back
        </Typography>

        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Sign in to your ShopEase account
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            {...register("email", {
              required: "Email is required",
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            {...register("password", {
              required: "Password is required",
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          
        </Box>

        <Typography textAlign="center" sx={{ mt: 3 }}>
          Don't have an account?{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            Register
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default LoginPage;