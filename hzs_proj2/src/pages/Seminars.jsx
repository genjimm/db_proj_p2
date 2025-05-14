import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSeminars, createEvent, deleteEvent } from '../utils/api';
import { Card, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';

const Seminars = () => {
  const [seminars, setSeminars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    e_name: '',
    topic: '',
    start_datetime: '',
    stop_datetime: '',
    descrip: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin');
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const response = await getSeminars();
      setSeminars(response.data);
    } catch (err) {
      console.error('Error fetching seminars:', err);
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
        event_type: 'S'
      };
      
      await createEvent(eventData);
      setShowModal(false);
      fetchSeminars();
      // Reset form
      setFormData({
        e_name: '',
        topic: '',
        start_datetime: '',
        stop_datetime: '',
        descrip: '',
      });
    } catch (err) {
      console.error('Error creating seminar:', err);
      alert('Failed to create seminar: ' + err.message);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this seminar?')) {
      try {
        await deleteEvent(eventId);
        fetchSeminars();
      } catch (err) {
        console.error('Error deleting seminar:', err);
        alert('Failed to delete seminar: ' + err.message);
      }
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Seminars</h2>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add New Seminar
          </Button>
        )}
      </div>

      <div className="row">
        {seminars.map(seminar => (
          <div key={seminar.event_id} className="col-md-4 mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{seminar.e_name}</Card.Title>
                <Card.Text>
                  <strong>Topic:</strong> {seminar.topic}<br />
                  <strong>Start:</strong> {new Date(seminar.start_datetime).toLocaleString()}<br />
                  <strong>End:</strong> {new Date(seminar.stop_datetime).toLocaleString()}<br />
                  <strong>Description:</strong> {seminar.descrip}
                </Card.Text>
                <div className="d-flex justify-content-between">
                  <Link to={`/seminars/${seminar.event_id}`}>
                    <Button variant="info">View Details</Button>
                  </Link>
                  {isAdmin && (
                    <Button 
                      variant="danger" 
                      onClick={() => handleDelete(seminar.event_id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Seminar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Seminar Name</Form.Label>
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="descrip"
                value={formData.descrip}
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
            Create Seminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Seminars; 