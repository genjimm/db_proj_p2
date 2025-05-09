import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExhibitions } from '../utils/api';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await getExhibitions();
        console.log('Exhibitions response:', response);
        console.log('Exhibitions data:', response.data);
        setExhibitions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exhibitions:', err);
        setError('Failed to fetch exhibitions');
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Exhibitions</h2>
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
                  <Link to={`/exhibitions/${exhibition.event_id}`}>
                    <Button variant="primary">View Details</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default Exhibitions; 