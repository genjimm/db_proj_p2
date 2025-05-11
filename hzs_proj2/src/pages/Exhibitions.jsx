import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExhibitions, createEvent, deleteEvent } from '../utils/api';
import { Card, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    e_name: '',
    topic: '',
    start_datetime: '',
    stop_datetime: '',
    expense: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin');
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const response = await getExhibitions();
      console.log('Exhibitions response:', response);
      console.log('Exhibitions data:', response.data);
      setExhibitions(response.data);
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
    }
  };

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
      const eventData = {
        ...formData,
        event_type: 'E',
        expense: parseFloat(formData.expense)
      };
      
      await createEvent(eventData);
      setShowModal(false);
      fetchExhibitions();
      // Reset form
      setFormData({
        e_name: '',
        topic: '',
        start_datetime: '',
        stop_datetime: '',
        expense: '',
      });
    } catch (err) {
      console.error('Error creating exhibition:', err);
      alert('Failed to create exhibition: ' + err.message);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this exhibition?')) {
      try {
        await deleteEvent(eventId);
        fetchExhibitions();
      } catch (err) {
        console.error('Error deleting exhibition:', err);
        alert('Failed to delete exhibition: ' + err.message);
      }
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Exhibitions</h2>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add New Exhibition
          </Button>
        )}
      </div>

      <Row>
        {exhibitions.map((exhibition) => {
          console.log('Exhibition object:', exhibition);
          console.log('Exhibition event_id:', exhibition.event_id);
          return (
            <Col key={exhibition.event_id} md={4} className="mb-4">
              <Card>
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
                  <div className="d-flex justify-content-between">
                    <Link to={`/exhibitions/${exhibition.event_id}`}>
                      <Button variant="info">View Details</Button>
                    </Link>
                    {isAdmin && (
                      <Button 
                        variant="danger" 
                        onClick={() => handleDelete(exhibition.event_id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Exhibition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Exhibition Name</Form.Label>
              <Form.Control
                type="text"
                name="e_name"
                value={formData.e_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Control
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="stop_datetime"
                value={formData.stop_datetime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expense</Form.Label>
              <Form.Control
                type="number"
                name="expense"
                value={formData.expense}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Exhibition
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Exhibitions; 