
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <Container className="mt-5">
      <Row className="justify-content-center text-center">
        <Col md={8}>
          <h1 className="mb-4">Welcome to SkillKart</h1>
          <p className="lead mb-4">
            Build personalized learning roadmaps to master new skills efficiently.
            Get curated resources, track your progress, and connect with peers.
          </p>
          
          {!currentUser ? (
            <div>
              <Link to="/signup">
                <Button variant="primary" size="lg" className="me-3">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline-primary" size="lg">Log In</Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button variant="primary" size="lg">Go to Dashboard</Button>
            </Link>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🧭</div>
              <Card.Title>Personalized Roadmaps</Card.Title>
              <Card.Text>
                Get a customized learning path based on your goals, interests, and available time.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
              <Card.Title>Curated Resources</Card.Title>
              <Card.Text>
                Access hand-picked videos, blogs, and interactive quizzes for each step of your journey.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
              <Card.Title>Track Progress</Card.Title>
              <Card.Text>
                Earn XP, unlock badges, and stay motivated as you complete modules.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}