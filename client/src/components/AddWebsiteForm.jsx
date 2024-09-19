import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const AddWebsiteForm = ({ fetchWebsites, setCheckInterval }) => {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tags, setTags] = useState('');
    const [intervalTime, setIntervalTime] = useState(10); // Default to 10 minutes

    // Function to handle website form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        try {
            const response = await axios.post('http://localhost:5000/addWebsite', {
                url,
                name,
                email,
                tags: tagsArray,
            });

            console.log('Website added:', response.data);
            fetchWebsites();
        } catch (error) {
            console.error('Error adding website:', error.message);
        }
    };

    // Function to handle interval change and update the backend
    const handleIntervalChange = async (event) => {
        const newInterval = parseInt(event.target.value);
        setIntervalTime(newInterval);
        setCheckInterval(newInterval); // Update checkInterval in parent component

        // Send updated interval to the backend
        try {
            const response = await axios.post('http://localhost:5000/updateInterval', {
                interval: newInterval, // Interval in minutes
            });
            console.log('Interval updated:', response.data);
        } catch (error) {
            console.error('Error updating interval:', error.message);
        }
    };

    return (
        <div>
            <h2 className="form-heading">Add Website</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Domain"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Label"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    required
                />
                <button type="submit">Add Website</button>
            </form>

            {/* Input for setting the interval time */}
            <div className="interval-input">
                <label htmlFor="intervalTime">Check Interval (in minutes): </label>
                <input
                    type="number"
                    id="intervalTime"
                    value={intervalTime}
                    onChange={handleIntervalChange}
                    min="1"
                />
            </div>
        </div>
    );
};

export default AddWebsiteForm;
