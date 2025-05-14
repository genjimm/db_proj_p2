import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSeminars, getMyInvitations } from '../utils/api';
import { Container, Card, Row, Col, Tabs, Tab } from 'react-bootstrap';

const MyInvitations = () => {
  const [seminars, setSeminars] = useState([]);
  const [invitations, setInvitations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all seminars
        const seminarsResponse = await getSeminars();
        setSeminars(seminarsResponse.data);

        // Get invitation information for each seminar
        const invitationsData = {};
        for (const seminar of seminarsResponse.data) {
          try {
            const response = await getMyInvitations(seminar.event_id);
            invitationsData[seminar.event_id] = response.data;
          } catch (err) {
            console.error(`Failed to fetch invitations for seminar ${seminar.event_id}`);
          }
        }
        setInvitations(invitationsData);
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
      <h2 className="mb-4">My Invitations</h2>
      <Tabs defaultActiveKey="seminars" className="mb-4">
        <Tab eventKey="seminars" title="Seminars">
          <Row>
            {seminars
              .filter(seminar => invitations[seminar.event_id]?.length > 0)
              .map((seminar) => (
                <Col key={seminar.event_id} md={6} className="mb-4">
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
                      <div>
                        <strong>Your Invitation:</strong>
                        <ul>
                          {invitations[seminar.event_id].map((inv) => (
                            <li key={inv.invitation_id}>
                              Name: {inv.invitee_name}<br />
                              Email: {inv.invitee_email}<br />
                              Invited at: {new Date(inv.invited_at).toLocaleString()}
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

export default MyInvitations; 