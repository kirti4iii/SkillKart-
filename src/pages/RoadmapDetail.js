// src/pages/RoadmapDetail.js
import React, { useState, useEffect } from "react";
import { Container, Card, Badge, ProgressBar, Button, Row, Col, Form, Alert } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  doc, getDoc, updateDoc, collection, addDoc, query, 
  where, getDocs, orderBy 
} from "firebase/firestore";
import { db } from "../firebase.real";

export default function RoadmapDetail() {
  const { roadmapId } = useParams();
  const { currentUser } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [xpGained, setXpGained] = useState(null);
  const [moduleResources, setModuleResources] = useState({});
  
  useEffect(() => {
    async function fetchRoadmap() {
      try {
        // Fetch roadmap
        const roadmapDocRef = doc(db, "roadmaps", roadmapId);
        const roadmapDoc = await getDoc(roadmapDocRef);
        
        if (!roadmapDoc.exists()) {
          setError("Roadmap not found");
          setLoading(false);
          return;
        }
        
        const roadmapData = { id: roadmapDoc.id, ...roadmapDoc.data() };
        setRoadmap(roadmapData);
        
        // Fetch discussions
        const discussionsQuery = query(
          collection(db, "discussions"),
          where("roadmapId", "==", roadmapId),
          orderBy("createdAt", "desc")
        );
        
        const discussionsSnapshot = await getDocs(discussionsQuery);
        const discussionsList = [];
        
        discussionsSnapshot.forEach(doc => {
          discussionsList.push({ id: doc.id, ...doc.data() });
        });
        
        setDiscussions(discussionsList);
        
        // Fetch resources for each module
        const moduleResources = {}; // Map to store resources by module ID
        
        // For each module in the roadmap, fetch resources
        for (const module of roadmapData.modules) {
          const moduleId = module.week.toString();
          
          const resourcesQuery = query(
            collection(db, "resources"),
            where("roadmapId", "==", roadmapId),
            where("moduleId", "==", moduleId)
          );
          
          const resourcesSnapshot = await getDocs(resourcesQuery);
          const resourcesList = [];
          
          resourcesSnapshot.forEach(doc => {
            resourcesList.push({ id: doc.id, ...doc.data() });
          });
          
          moduleResources[moduleId] = resourcesList;
        }
        
        setModuleResources(moduleResources);
      } catch (error) {
        setError("Failed to load roadmap: " + error.message);
      }
      
      setLoading(false);
    }
    
    fetchRoadmap();
  }, [roadmapId]);
  
  async function updateTopicStatus(moduleIndex, topicIndex, newStatus) {
    try {
      // Create a deep copy of the roadmap to avoid direct state mutation
      const updatedRoadmap = JSON.parse(JSON.stringify(roadmap));
      updatedRoadmap.modules[moduleIndex].topics[topicIndex].status = newStatus;
      
      // Calculate overall progress
      let completedTopics = 0;
      let totalTopics = 0;
      
      updatedRoadmap.modules.forEach(module => {
        module.topics.forEach(topic => {
          totalTopics++;
          if (topic.status === "completed") {
            completedTopics++;
          }
        });
      });
      
      const progress = Math.round((completedTopics / totalTopics) * 100);
      updatedRoadmap.progress = progress;
      
      // Update the state first for immediate feedback to user
      setRoadmap(updatedRoadmap);
      
      // Update roadmap in Firestore
      await updateDoc(doc(db, "roadmaps", roadmapId), {
        modules: updatedRoadmap.modules,
        progress: progress,
        lastUpdated: new Date().toISOString()
      });
      
      // Show XP gained notification if topic was completed
      if (newStatus === "completed") {
        setXpGained(10); // Award 10 XP for completing a topic
        
        // Update user's XP in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentXP = userData.xp || 0;
          
          await updateDoc(userDocRef, {
            xp: currentXP + 10
          });
        }
        
        // Hide XP notification after 3 seconds
        setTimeout(() => {
          setXpGained(null);
        }, 3000);
      }
    } catch (error) {
      setError("Failed to update progress: " + error.message);
      console.error("Error updating topic status:", error);
    }
  }
  
  async function addComment(e) {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      const comment = {
        roadmapId: roadmapId,
        userId: currentUser.uid,
        userName: currentUser.email.split('@')[0], // Simple way to get a username
        content: newComment,
        createdAt: new Date().toISOString()
      };
      
      const commentRef = await addDoc(collection(db, "discussions"), comment);
      
      setDiscussions([{id: commentRef.id, ...comment}, ...discussions]);
      setNewComment("");
    } catch (error) {
      setError("Failed to add comment: " + error.message);
    }
  }
  
  if (loading) {
    return <Container className="mt-5 text-center">Loading roadmap...</Container>;
  }
  
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </Container>
    );
  }
  
  if (!roadmap) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Roadmap not found</Alert>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {xpGained && (
        <Alert variant="success" className="position-fixed" style={{ top: '80px', right: '20px', zIndex: 1000 }}>
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '24px' }}>🎉</div>
            <div>
              <strong>+{xpGained} XP</strong>
              <p className="mb-0">Great job completing a topic!</p>
            </div>
          </div>
        </Alert>
      )}
      
      <div className="mb-4">
        <Link to="/dashboard">
          <Button variant="outline-secondary" size="sm">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center">
            <div>
              <h2>{roadmap.title}</h2>
              <Badge bg="info">{roadmap.skill}</Badge>
            </div>
            <div>
              <small>Duration: {roadmap.duration} weeks</small>
            </div>
          </Card.Title>
          
          <div className="mt-3 mb-4">
            <div className="d-flex justify-content-between mb-1">
              <div>Progress</div>
              <div>{roadmap.progress}%</div>
            </div>
            <ProgressBar now={roadmap.progress} variant="success" />
          </div>
          
          <h3 className="mt-4 mb-3">Weekly Modules</h3>
          
          {roadmap.modules.map((module, moduleIndex) => (
            <Card key={moduleIndex} className="mb-3">
              <Card.Header>
                <div className="d-flex justify-content-between">
                  <div><strong>Week {module.week}: {module.title}</strong></div>
                  <div>
                    {
                      module.topics.every(topic => topic.status === "completed") ? (
                        <Badge bg="success">Completed</Badge>
                      ) : module.topics.some(topic => topic.status === "in-progress" || topic.status === "completed") ? (
                        <Badge bg="primary">In Progress</Badge>
                      ) : (
                        <Badge bg="secondary">Not Started</Badge>
                      )
                    }
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Text>{module.description}</Card.Text>
                
                <h5 className="mt-3 mb-2">Topics to Learn</h5>
                {module.topics.map((topic, topicIndex) => (
                  <Card key={topicIndex} className="mb-2">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>{topic.name}</h6>
                        </div>
                        <div>
                          {topic.status === "completed" ? (
                            <Badge bg="success">Completed</Badge>
                          ) : topic.status === "in-progress" ? (
                            <Badge bg="primary">In Progress</Badge>
                          ) : (
                            <Badge bg="secondary">Not Started</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        {topic.status !== "completed" && (
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => updateTopicStatus(moduleIndex, topicIndex, "completed")}
                            className="me-2"
                          >
                            Mark Complete
                          </Button>
                        )}
                        
                        {topic.status === "not-started" && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => updateTopicStatus(moduleIndex, topicIndex, "in-progress")}
                          >
                            Start Learning
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                
                <h5 className="mt-4 mb-2">Learning Resources</h5>
                <Row>
                  {moduleResources[module.week.toString()] && moduleResources[module.week.toString()].length > 0 ? (
                    moduleResources[module.week.toString()].map((resource, index) => (
                      <Col md={4} key={index} className="mb-2">
                        <Card>
                          <Card.Body>
                            <div className="d-flex align-items-center">
                              <div className="me-3" style={{ fontSize: '24px' }}>
                                {resource.type === "video" ? "🎬" : resource.type === "blog" ? "📝" : "❓"}
                              </div>
                              <div>
                                <h6 className="mb-0">{resource.title}</h6>
                                <small>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</small>
                              </div>
                            </div>
                            {resource.description && (
                              <p className="small text-muted mt-1">{resource.description}</p>
                            )}
                            <div className="mt-2">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline-primary" size="sm">Access Resource</Button>
                              </a>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col>
                      <p className="text-muted">No resources available for this module yet.</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          <Card.Title>Discussion</Card.Title>
          
          <Form onSubmit={addComment} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Control 
                as="textarea" 
                rows={3}
                placeholder="Ask a question or share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary">Post Comment</Button>
          </Form>
          
          {discussions.length === 0 ? (
            <div className="text-center py-4">
              <p>No comments yet. Start the discussion!</p>
            </div>
          ) : (
            discussions.map(discussion => (
              <Card key={discussion.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{discussion.userName}</strong>
                    </div>
                    <div>
                      <small>{new Date(discussion.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                  <p className="mt-2">{discussion.content}</p>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}