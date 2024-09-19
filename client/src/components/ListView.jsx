import React from 'react';
import './ListView.css';

const ListView = ({ websites, openEditModal, openDeleteModal }) => {
    return (
        <div className="list-view-container">
            {websites.map((website) => (
                <div key={website.id} className="list-view-item">
                    <h3>{website.name}</h3>
                    <div className="status">
                        <span className={`dot ${website.status === 'up' ? 'green' : 'red'}`}></span>
                        {website.status}
                    </div>
                    <div className="email">{website.email}</div>
                    <div className="tags">
                        {website.tags
                            ? Array.isArray(website.tags)
                                ? website.tags.join(', ')
                                : website.tags.replace(/[\[\]"]/g, '')
                            : 'No tags'}
                    </div>

                    {/* List View Buttons */}
                    <div className='list-view-button-container'> 
                        <button
                            onClick={() => openEditModal(website)}
                            className="list-edit-button"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(website.id)}
                            className="list-delete-button"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListView;
