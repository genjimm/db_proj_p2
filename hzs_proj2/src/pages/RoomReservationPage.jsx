// src/pages/RoomReservationPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllRooms, getRoomReservations, createRoomReservation, updateRoomReservation, deleteRoomReservation } from '../utils/api';
import '../styles/RoomReservationPage.css';

const RoomReservationPage = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [formData, setFormData] = useState({
        topic_description: '',
        reserve_date: '',
        start_time: '',
        end_time: '',
        group_size: 1,
        l_name: '',
        f_name: '',
        customer_id: null
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchReservations(selectedRoom);
        }
    }, [selectedRoom]);

    const fetchRooms = async () => {
        try {
            const data = await getAllRooms();
            setRooms(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch room list');
            setLoading(false);
        }
    };

    const fetchReservations = async (roomId) => {
        try {
            const data = await getRoomReservations(roomId);
            setReservations(data);
        } catch (err) {
            setError('Failed to fetch reservations');
        }
    };

    const handleCreateReservation = async (e) => {
        e.preventDefault();
        try {
            await createRoomReservation({
                ...formData,
                room_id: selectedRoom
            });
            setShowForm(false);
            setFormData({
                topic_description: '',
                reserve_date: '',
                start_time: '',
                end_time: '',
                group_size: 1,
                l_name: '',
                f_name: '',
                customer_id: null
            });
            if (selectedRoom) {
                fetchReservations(selectedRoom);
            }
        } catch (err) {
            setError('Failed to create reservation');
        }
    };

    const handleUpdateReservation = async (e) => {
        e.preventDefault();
        try {
            await updateRoomReservation(editingReservation.reservation_id, {
                ...formData,
                room_id: selectedRoom
            });
            setShowForm(false);
            setEditingReservation(null);
            setFormData({
                topic_description: '',
                reserve_date: '',
                start_time: '',
                end_time: '',
                group_size: 1,
                l_name: '',
                f_name: '',
                customer_id: null
            });
            if (selectedRoom) {
                fetchReservations(selectedRoom);
            }
        } catch (err) {
            setError('Failed to update reservation');
        }
    };

    const handleDeleteReservation = async (reservationId) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            try {
                await deleteRoomReservation(reservationId);
                if (selectedRoom) {
                    fetchReservations(selectedRoom);
                }
            } catch (err) {
                setError('Failed to delete reservation');
            }
        }
    };

    const handleEditClick = (reservation) => {
        setEditingReservation(reservation);
        setFormData({
            topic_description: reservation.topic_description,
            reserve_date: reservation.reserve_date,
            start_time: reservation.start_time,
            end_time: reservation.end_time,
            group_size: reservation.group_size,
            l_name: reservation.l_name,
            f_name: reservation.f_name,
            customer_id: reservation.customer_id
        });
        setShowForm(true);
    };

    const handleFormSubmit = (e) => {
        if (editingReservation) {
            handleUpdateReservation(e);
        } else {
            handleCreateReservation(e);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="room-reservation-page">
            <h2>Room Reservation Management</h2>
            <div className="rooms-grid">
                {rooms.map(room => (
                    <div
                        key={room.room_id}
                        className={`room-card ${selectedRoom === room.room_id ? 'selected' : ''}`}
                        onClick={() => setSelectedRoom(room.room_id)}
                    >
                        <h3>Room {room.room_id}</h3>
                        <p>Capacity: {room.capacity} people</p>
                    </div>
                ))}
            </div>

            {selectedRoom && (
                <div className="reservations-section">
                    <div className="section-header">
                        <h3>Reservations for Room {selectedRoom}</h3>
                        {!showForm && (
                            <button 
                                className="create-button"
                                onClick={() => {
                                    setEditingReservation(null);
                                    setFormData({
                                        topic_description: '',
                                        reserve_date: '',
                                        start_time: '',
                                        end_time: '',
                                        group_size: 1,
                                        l_name: '',
                                        f_name: '',
                                        customer_id: null
                                    });
                                    setShowForm(true);
                                }}
                            >
                                Create New Reservation
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <form onSubmit={handleFormSubmit} className="reservation-form">
                            <h4>{editingReservation ? 'Edit Reservation' : 'Create New Reservation'}</h4>
                            <div className="form-group">
                                <label>Topic Description:</label>
                                <input
                                    type="text"
                                    value={formData.topic_description}
                                    onChange={(e) => setFormData({...formData, topic_description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Reservation Date:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.reserve_date}
                                    onChange={(e) => setFormData({...formData, reserve_date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Time:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Time:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Group Size:</label>
                                <input
                                    type="number"
                                    value={formData.group_size}
                                    onChange={(e) => setFormData({...formData, group_size: parseInt(e.target.value)})}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    value={formData.f_name}
                                    onChange={(e) => setFormData({...formData, f_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    value={formData.l_name}
                                    onChange={(e) => setFormData({...formData, l_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Customer ID:</label>
                                <input
                                    type="number"
                                    value={formData.customer_id || ''}
                                    onChange={(e) => setFormData({...formData, customer_id: e.target.value ? parseInt(e.target.value) : null})}
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="submit" className="submit-button">
                                    {editingReservation ? 'Update' : 'Create'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingReservation(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {reservations.length === 0 ? (
                        <p>No reservations found</p>
                    ) : (
                        <table className="reservations-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Topic</th>
                                    <th>Group Size</th>
                                    <th>Reserved By</th>
                                    <th>Customer ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(reservation => (
                                    <tr key={reservation.reservation_id}>
                                        <td>{formatDateTime(reservation.reserve_date)}</td>
                                        <td>{formatDateTime(reservation.start_time)}</td>
                                        <td>{formatDateTime(reservation.end_time)}</td>
                                        <td>{reservation.topic_description}</td>
                                        <td>{reservation.group_size}</td>
                                        <td>{reservation.f_name} {reservation.l_name}</td>
                                        <td>{reservation.customer_id || '-'}</td>
                                        <td>
                                            <button 
                                                className="edit-button"
                                                onClick={() => handleEditClick(reservation)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="delete-button"
                                                onClick={() => handleDeleteReservation(reservation.reservation_id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomReservationPage;