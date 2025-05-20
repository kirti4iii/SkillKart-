
import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAvailableSkills, generateRoadmap } from "../utils/roadmapGenerator";
import { doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase.real";

export default function Explore() {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const availableSkills = getAvailableSkills();

  async function handleGenerateRoadmap() {
    if (!selectedSkill) {
      return setError("Please select a skill");
    }
    
    try {
      setError("");
      setLoading(true);
      
      // Get user profile to access weekly time
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return setError("User profile not found. Please complete your profile setup.");
      }
      
      const userData = userDoc.data();
      const weeklyTime = userData.weeklyTime || 5;
      
      // Generate roadmap based on selected skill and user's weekly time
      const roadmap = generateRoadmap(selectedSkill, weeklyTime);
      
      if (!roadmap) {
        return setError("Failed to generate roadmap");
      }
      
      // Save roadmap to Firestore
      const roadmapData = {
        userId: currentUser.uid,
        title: roadmap.title,
        skill: selectedSkill,
        duration: roadmap.duration,
        modules: roadmap.modules,
        progress: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      const roadmapRef = await addDoc(collection(db, "roadmaps"), roadmapData);
      
      // Navigate to the roadmap detail page
      navigate(`/roadmap/${roadmapRef.id}`);
    } catch (error) {
      setError("Failed to generate roadmap: " + error.message);
    }
    
    setLoading(false);
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Explore Skills</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Select a Skill to Learn</Card.Title>
              <Card.Text>
                Choose a skill category to generate a personalized learning roadmap.
              </Card.Text>
              
              <Form.Group className="mb-4">
                <Form.Label>Select Skill</Form.Label>
                <Form.Control 
                  as="select"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                >
                  <option value="">-- Select a Skill --</option>
                  {availableSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              
              <Button 
                variant="primary" 
                onClick={handleGenerateRoadmap}
                disabled={loading || !selectedSkill}
              >
                Generate Roadmap
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>How It Works</Card.Title>
              <div className="mb-3">
                <strong>1. Choose a Skill</strong>
                <p>Select from our curated skill categories</p>
              </div>
              <div className="mb-3">
                <strong>2. Get a Personalized Roadmap</strong>
                <p>We'll generate a learning path based on your available time</p>
              </div>
              <div>
                <strong>3. Track Your Progress</strong>
                <p>Follow the step-by-step guide and mark your progress</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}