// EditModal.js
import React, { useState, useEffect } from 'react';
import './EditModal.css'; // Create a CSS file for styling the modal

const EditModal = ({ website, onSave, onCancel }) => {
    const [name, setName] = useState(website.name);
    const [email, setEmail] = useState(website.email);

    useEffect(() => {
        setName(website.name);
        setEmail(website.email);
    }, [website]);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Edit Website</h3>
                <input
                    type="text"
                    className="edit-input"
                    value={name}
                    placeholder="Update Label"
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    className="edit-input"
                    value={email}
                    placeholder="Update Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="domain">
                    <strong>Domain:</strong> {website.url}
                </div>
                <div className="modal-buttons">
                    <button onClick={() => onSave(website.id, name, email)} className="save-button">
                        Save
                    </button>
                    <button onClick={onCancel} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
