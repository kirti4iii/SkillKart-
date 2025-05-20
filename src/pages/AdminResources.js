// src/pages/AdminResources.js
import React, { useState, useEffect } from "react";
import { 
  Container, Card, Button, Form, Alert, Tab, Tabs, 
  Modal, Spinner, Badge
} from "react-bootstrap";
import { 
  collection, query, getDocs, doc, deleteDoc, where,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase.real";
import { useAuth } from "../contexts/AuthContext";
import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import { Link } from "react-router-dom";

export default function AdminResources() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState("");
  const [moduleOptions, setModuleOptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddResource, setShowAddResource] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        // Fetch all roadmaps for the admin to choose from
        const roadmapsQuery = query(collection(db, "roadmaps"));
        const roadmapsSnapshot = await getDocs(roadmapsQuery);
        const roadmapsList = [];
        
        roadmapsSnapshot.forEach(doc => {
          roadmapsList.push({ id: doc.id, ...doc.data() });
        });
        
        setRoadmaps(roadmapsList);
        
        if (roadmapsList.length > 0) {
          setSelectedRoadmap(roadmapsList[0].id);
        }
      } catch (error) {
        setError("Failed to load roadmaps: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRoadmaps();
  }, []);
  
  // When a roadmap is selected, load its modules
  useEffect(() => {
    async function fetchModulesForRoadmap() {
      if (!selectedRoadmap) return;
      
      try {
        const roadmapDoc = await getDoc(doc(db, "roadmaps", selectedRoadmap));
        
        if (roadmapDoc.exists()) {
          const roadmapData = roadmapDoc.data();
          if (roadmapData.modules && roadmapData.modules.length > 0) {
            setModuleOptions(roadmapData.modules.map((module, index) => ({
              id: module.week.toString(),
              title: `Week ${module.week}: ${module.title}`
            })));
            
            setSelectedModule(roadmapData.modules[0].week.toString());
          } else {
            setModuleOptions([]);
            setSelectedModule("");
          }
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    }
    
    fetchModulesForRoadmap();
  }, [selectedRoadmap]);
  
  // Load resources when a roadmap and module are selected
  useEffect(() => {
    async function fetchResources() {
      if (!selectedRoadmap || !selectedModule) return;
      
      try {
        setLoading(true);
        
        const resourcesQuery = query(
          collection(db, "resources"),
          where("roadmapId", "==", selectedRoadmap),
          where("moduleId", "==", selectedModule)
        );
        
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const resourcesList = [];
        
        resourcesSnapshot.forEach(doc => {
          resourcesList.push({ id: doc.id, ...doc.data() });
        });
        
        setResources(resourcesList);
      } catch (error) {
        setError("Failed to load resources: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResources();
  }, [selectedRoadmap, selectedModule]);
  
  async function handleDeleteResource(resourceId) {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteDoc(doc(db, "resources", resourceId));
        
        // Update the local state
        setResources(resources.filter(resource => resource.id !== resourceId));
      } catch (error) {
        setError("Failed to delete resource: " + error.message);
      }
    }
  }
  
  function handleResourceAdded(newResource) {
    setResources([...resources, newResource]);
    setShowAddResource(false);
  }
  
  if (loading && roadmaps.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading roadmaps...</p>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Learning Resources</h2>
        <Link to="/dashboard">
          <Button variant="outline-secondary">Back to Dashboard</Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Select Roadmap and Module</Card.Title>
          
          <Form.Group className="mb-3">
            <Form.Label>Select Roadmap</Form.Label>
            <Form.Control 
              as="select"
              value={selectedRoadmap}
              onChange={(e) => setSelectedRoadmap(e.target.value)}
            >
              {roadmaps.map(roadmap => (
                <option key={roadmap.id} value={roadmap.id}>
                  {roadmap.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Select Module</Form.Label>
            <Form.Control 
              as="select"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              disabled={moduleOptions.length === 0}
            >
              {moduleOptions.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title>Resources</Card.Title>
            <Button 
              variant="primary" 
              onClick={() => setShowAddResource(true)}
              disabled={!selectedRoadmap || !selectedModule}
            >
              Add New Resource
            </Button>
          </div>
          
          {loading && selectedRoadmap && selectedModule ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p>Loading resources...</p>
            </div>
          ) : (
            <ResourceList 
              resources={resources} 
              onDelete={handleDeleteResource}
              isAdmin={true}
            />
          )}
        </Card.Body>
      </Card>
      
      {/* Add Resource Modal */}
      <Modal 
        show={showAddResource} 
        onHide={() => setShowAddResource(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Learning Resource</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ResourceForm 
            roadmapId={selectedRoadmap}
            moduleId={selectedModule}
            onResourceAdded={handleResourceAdded}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}