import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddWebsiteForm from './components/AddWebsiteForm';
import WebsiteList from './components/WebsiteList';
import './App.css';

function App() {
    const [websites, setWebsites] = useState([]);
    const [dbStatus, setDbStatus] = useState('');
    const [checkInterval, setCheckInterval] = useState(10); // Default to 10 minutes

    useEffect(() => {
        axios.get('http://localhost:5000/checkDatabase')
            .then(response => setDbStatus(response.data.message))
            .catch(() => setDbStatus('Database not connected'));

        fetchWebsites();

        // Set an interval to check website status using checkInterval state
        const intervalId = setInterval(fetchWebsites, checkInterval * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [checkInterval]); // Re-run when checkInterval changes

    const fetchWebsites = () => {
        axios.get('http://localhost:5000/getWebsites')
            .then(response => setWebsites(response.data.websites || []))
            .catch(error => console.log(error));
    };

    return (
        <div className="App">
            <h1>Website Monitoring</h1>
            <p style={{ textAlign: "center" }}>{dbStatus}</p>
            <div className="container">
                <div className="left-box">
                    <AddWebsiteForm fetchWebsites={fetchWebsites} setCheckInterval={setCheckInterval} />
                </div>
                <div className="divider"></div>
                <div className="right-box">
                    <WebsiteList websites={websites} fetchWebsites={fetchWebsites} />
                </div>
            </div>
        </div>
    );
}

export default App;
