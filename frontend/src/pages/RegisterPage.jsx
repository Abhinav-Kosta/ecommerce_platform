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
import { useState } from "react";
import { registerUser } from "../api/authApi";

function RegisterPage() {

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const { confirmPassword, ...userData } = data;

      const response = await registerUser(userData);

      // console.log("Registration successful:", response);
      setSuccessMessage("Account created successfully!");
      navigate("/login");
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
    watch,
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
          Create Account
        </Typography>

        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Join ShopEase and start shopping
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <TextField
            label="Full Name"
            fullWidth
            required
            {...register("name", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

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
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

        </Box>

        <Typography textAlign="center" sx={{ mt: 3 }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default RegisterPage;