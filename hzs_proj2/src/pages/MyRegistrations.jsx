import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExhibitions, getMyRegistrations } from '../utils/api';
import { Container, Card, Row, Col, Tabs, Tab } from 'react-bootstrap';

const MyRegistrations = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取所有展览
        const exhibitionsResponse = await getExhibitions();
        setExhibitions(exhibitionsResponse.data);

        // 获取每个展览的报名信息
        const registrationsData = {};
        for (const exhibition of exhibitionsResponse.data) {
          try {
            const response = await getMyRegistrations(exhibition.event_id);
            registrationsData[exhibition.event_id] = response.data;
          } catch (err) {
            console.error(`Failed to fetch registrations for exhibition ${exhibition.event_id}`);
          }
        }
        setRegistrations(registrationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Registrations</h2>
      <Tabs defaultActiveKey="exhibitions" className="mb-4">
        <Tab eventKey="exhibitions" title="Exhibitions">
          <Row>
            {exhibitions
              .filter(exhibition => registrations[exhibition.event_id]?.length > 0)
              .map((exhibition) => (
                <Col key={exhibition.event_id} md={6} className="mb-4">
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
                      <div>
                        <strong>Your Registration:</strong>
                        <ul>
                          {registrations[exhibition.event_id].map((reg) => (
                            <li key={reg.registration_id}>
                              Name: {reg.registrant_name}<br />
                              Email: {reg.registrant_email}<br />
                              Registered at: {new Date(reg.registered_at).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default MyRegistrations; 