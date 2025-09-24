import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

interface Reservation {
  id: number;
  startDate: string;
  endDate: string;
  notes: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingReservations, setUpcomingReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8082/api/reservations"
        );
        setUpcomingReservations(response.data.slice(0, 3)); // Show only next 3
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/reservations"
                  fullWidth
                >
                  Make Reservation
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/duties"
                  fullWidth
                >
                  View Duties
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Reservations */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Upcoming Reservations
            </Typography>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : upcomingReservations.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {upcomingReservations.map((reservation) => (
                  <Card key={reservation.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6">
                        {reservation.user.firstName} {reservation.user.lastName}
                      </Typography>
                      <Typography color="text.secondary">
                        {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                        {new Date(reservation.endDate).toLocaleDateString()}
                      </Typography>
                      {reservation.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {reservation.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No upcoming reservations
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Lake House Info */}
        <Grid size={12}>
          <Paper
            sx={{
              p: 3,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Higgins Lake House
            </Typography>
            <Typography variant="h6">
              Your perfect getaway awaits on the shores of beautiful Higgins
              Lake
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
