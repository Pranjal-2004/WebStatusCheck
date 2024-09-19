import React from 'react';
import "./GridView.css";

const GridView = ({ websites, openEditModal, openDeleteModal }) => {
    return (
        <div className="grid-view-container">
            {websites.map((website) => (
                <div key={website.id} className="grid-view-item">
                    <h3>{website.name}</h3>
                    <div className="status">
                        <span className={`dot ${website.status === 'up' ? 'green' : 'red'}`}></span>
                        <div>{website.status}</div>
                    </div>
                    <div className="email">{website.email}</div>
                    <div className="tags">
                        {website.tags
                            ? Array.isArray(website.tags)
                                ? website.tags.map(tag => <span key={tag}>{tag}</span>)
                                : website.tags.replace(/[\[\]"]/g, '').split(',').map(tag => <span key={tag}>{tag.trim()}</span>)
                            : 'No tags'}
                    </div>

                    {/* Grid View Buttons */}
                    <div className="grid-view-button-container">
                        <button
                            onClick={() => openEditModal(website)}
                            className="grid-edit-button"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(website.id)}
                            className="grid-delete-button"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GridView;
