
import React, { useState } from "react";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.real";

export default function ProfileSetup() {
  const [interests, setInterests] = useState([]);
  const [goal, setGoal] = useState("");
  const [weeklyTime, setWeeklyTime] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const skillOptions = [
    "Web Development", 
    "UI/UX Design", 
    "Data Science", 
    "Mobile Development", 
    "DevOps",
    "Machine Learning"
  ];

  const goalOptions = [
    "Career Switch", 
    "Skill Enhancement", 
    "Hobby", 
    "Professional Growth"
  ];

  function handleInterestChange(e) {
    const value = e.target.value;
    if (e.target.checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter(interest => interest !== value));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (interests.length === 0) {
      return setError("Please select at least one interest");
    }
    
    if (!goal) {
      return setError("Please select a goal");
    }

    try {
      setError("");
      setLoading(true);
      
      // Save user profile to Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        interests,
        goal,
        weeklyTime,
        createdAt: new Date().toISOString()
      });
      
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to update profile: " + error.message);
    }

    setLoading(false);
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Setup Your Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label><strong>What skills are you interested in?</strong></Form.Label>
                {skillOptions.map(skill => (
                  <Form.Check 
                    type="checkbox"
                    id={`skill-${skill}`}
                    label={skill}
                    value={skill}
                    key={skill}
                    onChange={handleInterestChange}
                    className="mb-2"
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label><strong>What is your learning goal?</strong></Form.Label>
                {goalOptions.map(goalOption => (
                  <Form.Check 
                    type="radio"
                    id={`goal-${goalOption}`}
                    label={goalOption}
                    value={goalOption}
                    name="goal"
                    key={goalOption}
                    onChange={(e) => setGoal(e.target.value)}
                    className="mb-2"
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label><strong>How much time can you dedicate weekly? (hours)</strong></Form.Label>
                <Form.Range 
                  min={1} 
                  max={20} 
                  value={weeklyTime}
                  onChange={(e) => setWeeklyTime(parseInt(e.target.value))}
                />
                <div className="text-center">{weeklyTime} hours per week</div>
              </Form.Group>

              <Button disabled={loading} className="w-100" type="submit">
                Save Profile
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}