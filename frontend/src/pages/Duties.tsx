import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import axios from "axios";

interface Duty {
  id: number;
  name: string;
  description: string;
  estimatedHours: number;
  priority: string;
}

interface DutyAssignment {
  id: number;
  assignedDate: string;
  status: string;
  notes: string;
  duty: Duty;
  user: {
    firstName: string;
    lastName: string;
  };
}

const Duties: React.FC = () => {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);

  useEffect(() => {
    fetchDuties();
    fetchAssignments();
  }, []);

  const fetchDuties = async () => {
    try {
      const response = await axios.get("http://localhost:8082/api/duties");
      setDuties(response.data);
    } catch (error) {
      console.error("Error fetching duties:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8082/api/duties/assignments"
      );
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleSignUp = async (dutyId: number) => {
    try {
      await axios.post(`http://localhost:8082/api/duties/${dutyId}/assign`, {
        assignedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error signing up for duty:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Lake House Duties
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Available Duties
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {duties.map((duty) => (
            <Card
              key={duty.id}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h3">
                    {duty.name}
                  </Typography>
                  <Chip
                    label={duty.priority}
                    color={getPriorityColor(duty.priority) as any}
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {duty.description}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Estimated time: {duty.estimatedHours} hours
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleSignUp(duty.id)}
                  fullWidth
                >
                  Sign Up
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Current Assignments
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 3,
          }}
        >
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{assignment.duty.name}</Typography>
                  <Chip
                    label={assignment.status}
                    color={
                      assignment.status === "COMPLETED" ? "success" : "primary"
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Assigned to: {assignment.user.firstName}{" "}
                  {assignment.user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(assignment.assignedDate).toLocaleDateString()}
                </Typography>
                {assignment.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {assignment.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Duties;
