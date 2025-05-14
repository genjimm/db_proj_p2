import React, { useState, useEffect } from 'react';
import { getAllRooms, getRoomReservations, createReservation, getMyReservations } from '../utils/api';
import '../styles/StudyRoomPage.css';

const StudyRoomPage = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reservations, setReservations] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [formData, setFormData] = useState({
        topic_description: '',
        start_time: '',
        end_time: '',
        group_size: 1,
        l_name: '',
        f_name: ''
    });

    useEffect(() => {
        fetchRooms();
        fetchMyReservations();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchRoomReservations();
        }
    }, [selectedRoom, selectedDate]);

    const fetchRooms = async () => {
        try {
            const data = await getAllRooms();
            setRooms(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch rooms');
            setLoading(false);
        }
    };

    const fetchRoomReservations = async () => {
        try {
            const data = await getRoomReservations(selectedRoom, selectedDate);
            setReservations(data);
        } catch (err) {
            setError('Failed to fetch reservations');
        }
    };

    const fetchMyReservations = async () => {
        try {
            const data = await getMyReservations();
            setMyReservations(data);
        } catch (err) {
            setError('Failed to fetch your reservations');
        }
    };

    const handleRoomSelect = (roomId) => {
        setSelectedRoom(roomId);
        setShowReservationForm(false);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
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
            const reservationData = {
                ...formData,
                room_id: selectedRoom,
                reserve_date: selectedDate
            };
            await createReservation(reservationData);
            setShowReservationForm(false);
            setFormData({
                topic_description: '',
                start_time: '',
                end_time: '',
                group_size: 1,
                l_name: '',
                f_name: ''
            });
            fetchRoomReservations();
            fetchMyReservations();
        } catch (err) {
            setError('Failed to create reservation');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="study-room-page">
            <h1>Study Room Reservations</h1>
            
            <div className="rooms-section">
                <h2>Available Rooms</h2>
                <div className="rooms-grid">
                    {rooms.map(room => (
                        <div
                            key={room.room_id}
                            className={`room-card ${selectedRoom === room.room_id ? 'selected' : ''}`}
                            onClick={() => handleRoomSelect(room.room_id)}
                        >
                            <h3>Room {room.room_id}</h3>
                            <p>Capacity: {room.capacity} people</p>
                        </div>
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <div className="reservation-section">
                    <h2>Room {selectedRoom} Reservations</h2>
                    <div className="date-selector">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="reservations-list">
                        <h3>Reservations for {selectedDate}</h3>
                        {reservations.length === 0 ? (
                            <p>No reservations for this date</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Topic</th>
                                        <th>Group Size</th>
                                        <th>Reserved By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map(reservation => (
                                        <tr key={reservation.reservation_id}>
                                            <td>{reservation.start_time} - {reservation.end_time}</td>
                                            <td>{reservation.topic_description}</td>
                                            <td>{reservation.group_size}</td>
                                            <td>{reservation.f_name} {reservation.l_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <button
                        className="reserve-button"
                        onClick={() => setShowReservationForm(true)}
                    >
                        Make Reservation
                    </button>

                    {showReservationForm && (
                        <div className="reservation-form">
                            <h3>New Reservation</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="topic">Topic Description:</label>
                                    <input
                                        type="text"
                                        id="topic"
                                        name="topic_description"
                                        value={formData.topic_description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="start_time">Start Time:</label>
                                    <input
                                        type="time"
                                        id="start_time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_time">End Time:</label>
                                    <input
                                        type="time"
                                        id="end_time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="group_size">Group Size:</label>
                                    <input
                                        type="number"
                                        id="group_size"
                                        name="group_size"
                                        value={formData.group_size}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="f_name">First Name:</label>
                                    <input
                                        type="text"
                                        id="f_name"
                                        name="f_name"
                                        value={formData.f_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="l_name">Last Name:</label>
                                    <input
                                        type="text"
                                        id="l_name"
                                        name="l_name"
                                        value={formData.l_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-buttons">
                                    <button type="submit">Submit Reservation</button>
                                    <button type="button" onClick={() => setShowReservationForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            <div className="my-reservations-section">
                <h2>My Reservations</h2>
                {myReservations.length === 0 ? (
                    <p>You have no reservations</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Room</th>
                                <th>Topic</th>
                                <th>Group Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myReservations.map(reservation => (
                                <tr key={reservation.reservation_id}>
                                    <td>{reservation.reserve_date}</td>
                                    <td>{reservation.start_time} - {reservation.end_time}</td>
                                    <td>Room {reservation.room_id}</td>
                                    <td>{reservation.topic_description}</td>
                                    <td>{reservation.group_size}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudyRoomPage; 