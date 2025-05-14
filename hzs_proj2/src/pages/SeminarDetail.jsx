import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSeminar, createInvitation, getMyInvitations } from '../utils/api';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';

const SeminarDetail = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const [seminar, setSeminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationSuccess, setInvitationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    invitee_name: '',
    invitee_email: '',
  });
  const [alreadyInvited, setAlreadyInvited] = useState(false);

  useEffect(() => {
    const fetchSeminar = async () => {
      try {
        const response = await getSeminar(event_id);
        setSeminar(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch seminar details');
        setLoading(false);
      }
    };
    fetchSeminar();
  }, [event_id]);

  useEffect(() => {
    const checkAlreadyInvited = async () => {
      try {
        const regs = await getMyInvitations(event_id);
        const myEmail = localStorage.getItem('userEmail');
        if (regs.data && myEmail && regs.data.some(inv => inv.invitee_email === myEmail)) {
          setAlreadyInvited(true);
        }
      } catch (err) {
        // ignore the error
      }
    };
    checkAlreadyInvited();
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
      await createInvitation(event_id, {
        ...formData,
        invited_at: new Date().toISOString()
      });
      localStorage.setItem('userEmail', formData.invitee_email); // store the email
      setInvitationSuccess(true);
      setTimeout(() => {
        navigate('/my-invitations');
      }, 2000);
    } catch (err) {
      setError('Failed to create invitation');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!seminar) return <div>Seminar not found</div>;

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{seminar.e_name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {seminar.topic}
          </Card.Subtitle>
          <Card.Text>
            <strong>Start:</strong> {new Date(seminar.start_datetime).toLocaleString()}<br />
            <strong>End:</strong> {new Date(seminar.stop_datetime).toLocaleString()}<br />
            <strong>Description:</strong> {seminar.descrip}
          </Card.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Request Invitation</Card.Title>
          {invitationSuccess && (
            <Alert variant="success">
              Invitation request successful! Redirecting to your invitations...
            </Alert>
          )}
          {alreadyInvited ? (
            <Alert variant="info">
              You have already requested an invitation for this seminar with this email.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="invitee_name"
                  value={formData.invitee_name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="invitee_email"
                  value={formData.invitee_email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Request Invitation
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SeminarDetail; 