import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Modal, Table } from 'react-bootstrap';
import { getSeminars, getExhibitions, createEvent, deleteEvent } from '../utils/api';

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eventType, setEventType] = useState('E'); // 'E' for Exhibition, 'S' for Seminar
  const [formData, setFormData] = useState({
    e_name: '',
    topic: '',
    start_datetime: '',
    stop_datetime: '',
    expense: '', // for exhibition
    descrip: '', // for seminar
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [seminars, exhibitions] = await Promise.all([
        getSeminars(),
        getExhibitions()
      ]);
      setEvents([...seminars.data, ...exhibitions.data]);
    } catch (err) {
      console.error('Error fetching events:', err);
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
        event_type: eventType,
        expense: eventType === 'E' ? parseFloat(formData.expense) : undefined,
        descrip: eventType === 'S' ? formData.descrip : undefined
      };
      
      await createEvent(eventData);
      setShowModal(false);
      fetchEvents();
      // Reset form
      setFormData({
        e_name: '',
        topic: '',
        start_datetime: '',
        stop_datetime: '',
        expense: '',
        descrip: '',
      });
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event: ' + err.message);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event: ' + err.message);
      }
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Panel</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New Event
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Topic</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.event_id}>
              <td>{event.e_name}</td>
              <td>{event.event_type === 'E' ? 'Exhibition' : 'Seminar'}</td>
              <td>{event.topic}</td>
              <td>{new Date(event.start_datetime).toLocaleString()}</td>
              <td>{new Date(event.stop_datetime).toLocaleString()}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(event.event_id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Select 
                value={eventType} 
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="E">Exhibition</option>
                <option value="S">Seminar</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
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

            {eventType === 'E' && (
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
            )}

            {eventType === 'S' && (
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
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel; 