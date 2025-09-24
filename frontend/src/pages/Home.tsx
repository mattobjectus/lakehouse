import React from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" component="h1" gutterBottom>
            Welcome to Higgins Lake House
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ mb: 4, maxWidth: "600px" }}
          >
            Experience the beauty and tranquility of Michigan's pristine Higgins
            Lake. Schedule your perfect getaway at our beautiful lakehouse
            retreat.
          </Typography>
          {!user && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/login"
                sx={{ px: 4, py: 1.5, color: "white", borderColor: "white" }}
              >
                Sign In
              </Button>
            </Box>
          )}
          {user && (
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/dashboard"
              sx={{ px: 4, py: 1.5 }}
            >
              Go to Dashboard
            </Button>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h2" textAlign="center" gutterBottom>
          Your Perfect Lake Retreat
        </Typography>
        <Typography
          variant="h6"
          component="p"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: "800px", mx: "auto" }}
        >
          Nestled on the shores of beautiful Higgins Lake, our lakehouse offers
          the perfect blend of relaxation and recreation for families and
          friends.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardMedia
              component="img"
              height="250"
              image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Lake Activities"
            />
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                Water Activities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enjoy swimming, kayaking, fishing, and boating on the
                crystal-clear waters of Higgins Lake. Perfect for all ages and
                skill levels.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: "100%" }}>
            <CardMedia
              component="img"
              height="250"
              image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80"
              alt="Comfortable Accommodations"
            />
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                Comfortable Stay
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our fully equipped lakehouse features modern amenities, cozy
                bedrooms, and stunning lake views from every window.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: "100%" }}>
            <CardMedia
              component="img"
              height="250"
              image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
              alt="Nature Trails"
            />
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                Nature & Trails
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore the surrounding forests with hiking trails, wildlife
                watching, and peaceful spots perfect for relaxation and
                reflection.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Call to Action */}
      <Paper
        sx={{
          backgroundImage: `linear-gradient(rgba(25,118,210,0.8), rgba(25,118,210,0.8)), url('https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Book Your Stay?
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 4 }}>
            Join our community and start planning your perfect lake house
            getaway today.
          </Typography>
          {!user && (
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: "white",
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              Sign Up Now
            </Button>
          )}
        </Container>
      </Paper>
    </Box>
  );
};

export default Home;
