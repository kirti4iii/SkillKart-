// src/components/ResourceList.js
import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { getResourceTypeIcon } from "../utils/resourceTypes";

export default function ResourceList({ resources, onDelete, isAdmin }) {
  if (!resources || resources.length === 0) {
    return <p className="text-muted">No resources available yet.</p>;
  }
  
  return (
    <Row>
      {resources.map((resource) => (
        <Col md={4} key={resource.id} className="mb-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div className="me-2" style={{ fontSize: '24px' }}>
                  {getResourceTypeIcon(resource.type)}
                </div>
                <div>
                  <h5 className="mb-0">{resource.title}</h5>
                  <small>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</small>
                </div>
              </div>
              
              {resource.description && (
                <p className="small mb-2">{resource.description}</p>
              )}
              
              <div className="d-flex justify-content-between align-items-center">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline-primary" size="sm">
                    Access Resource
                  </Button>
                </a>
                
                {isAdmin && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => onDelete(resource.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}