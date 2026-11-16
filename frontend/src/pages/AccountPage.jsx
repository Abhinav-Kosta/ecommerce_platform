
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../api/authApi";

function AccountPage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await updateUserProfile({ name });

      setUser(response.data.user);
      setName(response.data.user.name);

      setSuccess(response.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Account
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Welcome, {user?.name}!
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ maxWidth: 450 }}
        >
          <TextField
            label="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 80 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email"
            value={user?.email || ""}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />

          <TextField
            label="Role"
            value={user?.role || ""}
            fullWidth
            disabled
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default AccountPage;