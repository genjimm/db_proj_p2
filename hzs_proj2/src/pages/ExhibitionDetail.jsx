import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExhibition, registerExhibition, getMyRegistrations } from '../utils/api';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';

const ExhibitionDetail = () => {
  const { event_id } = useParams();
  console.log('Event ID from URL:', event_id);
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    registrant_name: '',
    registrant_email: '',
  });
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        console.log('Fetching exhibition with ID:', event_id);
        const response = await getExhibition(event_id);
        console.log('Exhibition response:', response);
        setExhibition(response.data || response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exhibition:', err);
        setError('Failed to fetch exhibition details');
        setLoading(false);
      }
    };

    fetchExhibition();
  }, [event_id]);

  useEffect(() => {
    const checkAlreadyRegistered = async () => {
      try {
        const regs = await getMyRegistrations(event_id);
        const myEmail = localStorage.getItem('userEmail');
        if (regs.data && myEmail && regs.data.some(reg => reg.registrant_email === myEmail)) {
          setAlreadyRegistered(true);
        }
      } catch (err) {
        // 忽略错误
      }
    };
    checkAlreadyRegistered();
  }, [event_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerExhibition(event_id, {
        ...formData,
        registered_at: new Date().toISOString()
      });
      localStorage.setItem('userEmail', formData.registrant_email);
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/my-registrations');
      }, 2000);
    } catch (err) {
      setError('Failed to register for exhibition');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!exhibition) return <div>Exhibition not found</div>;

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{exhibition.e_name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {exhibition.topic}
          </Card.Subtitle>
          <Card.Text>
            <strong>Start:</strong> {new Date(exhibition.start_datetime).toLocaleString()}<br />
            <strong>End:</strong> {new Date(exhibition.stop_datetime).toLocaleString()}<br />
            <strong>Fee:</strong> ${exhibition.expense}
          </Card.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Register for this Exhibition</Card.Title>
          {registrationSuccess && (
            <Alert variant="success">
              Registration successful! Redirecting to your registrations...
            </Alert>
          )}
          {alreadyRegistered ? (
            <Alert variant="info">
              You have already registered for this exhibition with this email.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="registrant_name"
                  value={formData.registrant_name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="registrant_email"
                  value={formData.registrant_email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Register
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ExhibitionDetail; 