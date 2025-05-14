// src/pages/RoomPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../utils/api';
import '../styles/RoomPage.css';

const RoomPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        capacity: 1
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await getAllRooms();
            setRooms(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await createRoom(formData.capacity);
            setShowForm(false);
            setFormData({ capacity: 1 });
            fetchRooms();
        } catch (err) {
            setError('Failed to create room');
        }
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        try {
            await updateRoom(editingRoom.room_id, formData.capacity);
            setShowForm(false);
            setEditingRoom(null);
            setFormData({ capacity: 1 });
            fetchRooms();
        } catch (err) {
            setError('Failed to update room');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoom(roomId);
                fetchRooms();
            } catch (err) {
                setError('Failed to delete room');
            }
        }
    };

    const handleEditClick = async (roomId) => {
        try {
            const room = await getRoomById(roomId);
            setEditingRoom(room);
            setFormData({
                capacity: room.capacity
            });
            setShowForm(true);
        } catch (err) {
            setError('Failed to fetch room details');
        }
    };

    const handleFormSubmit = (e) => {
        if (editingRoom) {
            handleUpdateRoom(e);
        } else {
            handleCreateRoom(e);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="room-page">
            <h2>Room Management</h2>
            <div className="section-header">
                <h3>Study Rooms</h3>
                {!showForm && (
                    <button 
                        className="create-button"
                        onClick={() => {
                            setEditingRoom(null);
                            setFormData({ capacity: 1 });
                            setShowForm(true);
                        }}
                    >
                        Create New Room
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleFormSubmit} className="room-form">
                    <h4>{editingRoom ? 'Edit Room' : 'Create New Room'}</h4>
                    <div className="form-group">
                        <label>Capacity:</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            min="1"
                            required
                        />
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="submit-button">
                            {editingRoom ? 'Update' : 'Create'}
                        </button>
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingRoom(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {rooms.length === 0 ? (
                <p>No rooms found</p>
            ) : (
                <table className="rooms-table">
                    <thead>
                        <tr>
                            <th>Room ID</th>
                            <th>Capacity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map(room => (
                            <tr key={room.room_id}>
                                <td>{room.room_id}</td>
                                <td>{room.capacity} people</td>
                                <td>
                                    <button 
                                        className="edit-button"
                                        onClick={() => handleEditClick(room.room_id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDeleteRoom(room.room_id)}
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
    );
};

export default RoomPage;