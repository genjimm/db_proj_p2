import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSeminars } from '../utils/api';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const Seminars = () => {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        const response = await getSeminars();
        setSeminars(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch seminars');
        setLoading(false);
      }
    };

    fetchSeminars();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Seminars</h2>
      <Row>
        {seminars.map((seminar) => (
          <Col key={seminar.event_id} md={4} className="mb-4">
            <Card>
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
                <Link to={`/seminars/${seminar.event_id}`}>
                  <Button variant="primary">View Details</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Seminars; 