// src/components/ResourceForm.js
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { RESOURCE_TYPES } from "../utils/resourceTypes";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase.real";
import { useAuth } from "../contexts/AuthContext";

export default function ResourceForm({ roadmapId, moduleId, onResourceAdded }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { currentUser } = useAuth();
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) {
      return setError("Title and URL are required");
    }
    
    try {
      setError("");
      setSuccess("");
      setLoading(true);
      
      // Validate URL format
      try {
        new URL(url);
      } catch (_) {
        setError("Please enter a valid URL including http:// or https://");
        setLoading(false);
        return;
      }
      
      // Create the resource in Firestore
      const resourceData = {
        title,
        type,
        url,
        description,
        roadmapId,
        moduleId,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      
      const resourceRef = await addDoc(collection(db, "resources"), resourceData);
      
      // Success message
      setSuccess("Resource added successfully!");
      onResourceAdded({ id: resourceRef.id, ...resourceData });
      
      // Reset form
      setTitle("");
      setUrl("");
      setDescription("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError("Failed to add resource: " + error.message);
    }
    
    setLoading(false);
  }
  
  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Resource Title</Form.Label>
          <Form.Control 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Resource Type</Form.Label>
          <Form.Control 
            as="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {RESOURCE_TYPES.map(rt => (
              <option key={rt.id} value={rt.id}>
                {rt.icon} {rt.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>URL</Form.Label>
          <Form.Control 
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/resource"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Description (optional)</Form.Label>
          <Form.Control 
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        
        <Button 
          variant="primary" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Resource"}
        </Button>
      </Form>
    </>
  );
}
