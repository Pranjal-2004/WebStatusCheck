// WebsiteList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import ConfirmationModal from './ConfirmationModal';
import EditModal from './EditModal';
import GridView from './GridView';
import ListView from './ListView';

const WebsiteList = ({ websites, fetchWebsites }) => {
    const [isEditing, setIsEditing] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editWebsite, setEditWebsite] = useState(null);
    const [isGridView, setIsGridView] = useState(true); // State to toggle view
    const [selectedTag, setSelectedTag] = useState('All'); // State to filter by tags

    // Extract unique tags from websites and remove duplicates using Set
    const tags = ['All', ...new Set(
        websites.flatMap(website => 
            website.tags
                ? Array.isArray(website.tags)
                    ? website.tags.map(tag => tag.trim()) // If it's an array
                    : website.tags.replace(/[\[\]"]/g, '').split(',').map(tag => tag.trim()) // If it's a string with brackets/quotes
                : []
        )
    )];

    // Filter websites by the selected tag
    const filteredWebsites = selectedTag === 'All'
        ? websites
        : websites.filter(website => 
            website.tags
                ? Array.isArray(website.tags)
                    ? website.tags.map(tag => tag.trim()).includes(selectedTag)
                    : website.tags.replace(/[\[\]"]/g, '').split(',').map(tag => tag.trim()).includes(selectedTag)
                : false
        );

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/deleteWebsite/${id}`);
            fetchWebsites(); // Refresh the list after deleting a website
        } catch (error) {
            console.error('Error deleting website:', error.message);
        }
        setIsModalOpen(false);
    };

    const handleSave = async (id, name, email) => {
        try {
            await axios.put(`http://localhost:5000/updateWebsite/${id}`, {
                name,
                email,
            });
            fetchWebsites(); // Refresh the list after updating
            setIsEditing(null);
        } catch (error) {
            console.error('Error updating website:', error.message);
        }
        setEditWebsite(null);
    };

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    const openEditModal = (website) => {
        setEditWebsite(website);
    };

    return (
        <div>
            <div>
                <h2>Website Status</h2>
                <div className="heading-container">
                    <div className='button-container'>
                    
                    {/* Dropdown to filter by tags */}
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="tag-filter"
                    >
                        {tags.map(tag => (
                            <option key={tag} value={tag}>
                                {tag} {/* Display cleaned tag */}
                            </option>
                        ))}
                    </select>

                    {/* Button to toggle between Grid and List view */}
                    <button 
                        onClick={() => setIsGridView(!isGridView)} 
                        className="toggle-view-button"
                    >
                        {isGridView ? 'List View' : 'Grid View'}
                    </button>
                    </div>
                </div>
            </div>

            {/* Conditionally render GridView or ListView */}
            {isGridView 
                ? <GridView 
                    websites={filteredWebsites} 
                    openEditModal={openEditModal} 
                    openDeleteModal={openDeleteModal} 
                  />
                : <ListView 
                    websites={filteredWebsites} 
                    openEditModal={openEditModal} 
                    openDeleteModal={openDeleteModal} 
                  />
            }

            {/* Confirmation modal for delete action */}
            {isModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to delete this website?"
                    onConfirm={() => handleDelete(deleteId)}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}

            {/* Edit modal for editing website */}
            {editWebsite && (
                <EditModal
                    website={editWebsite}
                    onSave={handleSave}
                    onCancel={() => setEditWebsite(null)}
                />
            )}
            
        </div>
    );
};

export default WebsiteList;
