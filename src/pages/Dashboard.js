// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Badge } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.real";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(120);
  const [badges, setBadges] = useState([
    { id: 1, name: "Getting Started", icon: "🏆" },
    { id: 2, name: "First Week Complete", icon: "🎯" }
  ]);
  // Add a state variable for the demo roadmap
  const [demoRoadmap, setDemoRoadmap] = useState({
    id: "demo-roadmap",
    title: "Web Development Fundamentals",
    progress: 30,
    steps: [
      { id: 1, title: "HTML Basics", status: "completed", resources: 3 },
      { id: 2, title: "CSS Fundamentals", status: "in-progress", resources: 4 },
      { id: 3, title: "JavaScript Introduction", status: "not-started", resources: 5 },
      { id: 4, title: "Building Your First Website", status: "not-started", resources: 2 }
    ]
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      if (currentUser) {
        try {
          // Fetch user profile
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            
            // Fetch user roadmaps
            const roadmapsQuery = query(
              collection(db, "roadmaps"),
              where("userId", "==", currentUser.uid)
            );
            
            const roadmapsSnapshot = await getDocs(roadmapsQuery);
            const roadmaps = [];
            
            roadmapsSnapshot.forEach((doc) => {
              roadmaps.push({ id: doc.id, ...doc.data() });
            });
            
            setUserRoadmaps(roadmaps);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchUserData();
  }, [currentUser]);

  // Function to handle marking a step as complete
  const handleMarkComplete = (stepId) => {
    console.log(`Marking step ${stepId} as complete`);
    
    // Create a deep copy of the roadmap
    const updatedRoadmap = JSON.parse(JSON.stringify(demoRoadmap));
    
    // Update the specific step
    updatedRoadmap.steps = updatedRoadmap.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, status: "completed" };
      }
      return step;
    });
    
    // Calculate new progress
    const totalSteps = updatedRoadmap.steps.length;
    const completedSteps = updatedRoadmap.steps.filter(step => step.status === "completed").length;
    updatedRoadmap.progress = Math.round((completedSteps / totalSteps) * 100);
    
    // Update state with the new roadmap
    setDemoRoadmap(updatedRoadmap);
    
    // Add XP
    setXp(prev => prev + 10);
  };

  // Function to handle starting a learning step
  const handleStartLearning = (stepId) => {
    console.log(`Starting step ${stepId}`);
    
    // Create a deep copy of the roadmap
    const updatedRoadmap = JSON.parse(JSON.stringify(demoRoadmap));
    
    // Update the specific step
    updatedRoadmap.steps = updatedRoadmap.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, status: "in-progress" };
      }
      return step;
    });
    
    // Update state with the new roadmap
    setDemoRoadmap(updatedRoadmap);
  };

  // Function to navigate to the explore page
  const handleExploreClick = () => {
    navigate('/explore');
  };

  if (loading) {
    return <Container className="mt-5 text-center">Loading...</Container>;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <h2>Your Learning Dashboard</h2>
          
          {userRoadmaps.length === 0 ? (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Welcome to SkillKart!</Card.Title>
                <Card.Text>
                  You haven't started any roadmaps yet. Explore skills or try our demo roadmap below.
                </Card.Text>
                <Button variant="primary" onClick={handleExploreClick}>Explore Skills</Button>
              </Card.Body>
            </Card>
          ) : (
            userRoadmaps.map(roadmap => (
              <Card key={roadmap.id} className="mb-4">
                <Card.Body>
                  <Card.Title>{roadmap.title}</Card.Title>
                  <ProgressBar now={roadmap.progress} label={`${roadmap.progress}%`} className="mb-3" />
                  <Card.Text>Continue your learning journey!</Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                  >
                    Continue Learning
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
          
          {/* Demo Roadmap */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{demoRoadmap.title}</Card.Title>
              <ProgressBar now={demoRoadmap.progress} label={`${demoRoadmap.progress}%`} className="mb-3" />
              
              {demoRoadmap.steps.map((step) => (
                <Card key={step.id} className="mb-2">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{step.title}</h5>
                        <small>{step.resources} learning resources</small>
                      </div>
                      <div>
                        {step.status === "completed" ? (
                          <Badge bg="success">Completed</Badge>
                        ) : step.status === "in-progress" ? (
                          <Badge bg="primary">In Progress</Badge>
                        ) : (
                          <Badge bg="secondary">Not Started</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      {step.status !== "completed" && (
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => handleMarkComplete(step.id)}
                          className="me-2"
                        >
                          Mark Complete
                        </Button>
                      )}
                      
                      {step.status === "not-started" && (
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleStartLearning(step.id)}
                        >
                          Start Learning
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Your Progress</Card.Title>
              <div className="d-flex align-items-center mb-3">
                <div className="me-3" style={{ fontSize: '24px' }}>🔥</div>
                <div>
                  <h5 className="mb-0">{xp} XP</h5>
                  <small>Keep learning to earn more!</small>
                </div>
              </div>
              
              <Card.Title>Your Badges</Card.Title>
              <div className="d-flex flex-wrap">
                {badges.map(badge => (
                  <div key={badge.id} className="text-center me-3 mb-3">
                    <div style={{ fontSize: '36px' }}>{badge.icon}</div>
                    <div><small>{badge.name}</small></div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Community Discussion</Card.Title>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ fontSize: '24px' }}>👨‍💻</div>
                  <div>
                    <strong>John D.</strong>
                    <p className="mb-0">Any tips for learning React hooks?</p>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm">Reply</Button>
              </div>
              
              <div>
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ fontSize: '24px' }}>👩‍💻</div>
                  <div>
                    <strong>Sarah M.</strong>
                    <p className="mb-0">Just completed the CSS module. Feeling great!</p>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm">Reply</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}