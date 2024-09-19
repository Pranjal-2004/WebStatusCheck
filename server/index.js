require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());

// Enable CORS for all routes and origins
app.use(cors({
    origin: 'http://localhost:3000',
}));

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Using env variable for email user
        pass: process.env.EMAIL_PASS, // Using env variable for email password
    },
});

// API route to add a website
app.post('/addWebsite', async (req, res) => {
    const { url, name, email, tags } = req.body;

    try {
        if (!url || !name || !email || !tags) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('Websites')
            .insert([{ url, name, email, tags, status: 'up' }]); // Adding the tags field

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Website added successfully', data });
    } catch (error) {
        console.error('Error adding website:', error.message); 
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API route to delete a website
app.delete('/deleteWebsite/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase.from('Websites').delete().eq('id', id);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Website deleted successfully' });
    } catch (error) {
        console.error('Error deleting website:', error.message);
        res.status(500).json({ message: 'Error deleting website', error: error.message });
    }
});

// API route to get all websites
app.get('/getWebsites', async (req, res) => {
    const { tag } = req.query;
    let query = supabase.from('Websites').select('*');
    
    if (tag && tag !== 'All') {
        query = query.contains('tags', [tag]); // Filter websites by tag
    }
    
    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ message: 'Error fetching websites' });
    }

    res.status(200).json({ websites: data });
});

// Function to check the status of a website
const checkWebsiteStatus = async (website) => {
    try {
        const response = await axios.get(website.url);
        return response.status === 200 ? 'up' : 'down';
    } catch (error) {
        return 'down';
    }
};

// API route to update a website's name and email
app.put('/updateWebsite/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, tags } = req.body; // Include tags in the update

    try {
        const { error } = await supabase
            .from('Websites')
            .update({ name, email, tags }) // Add tags field to the update
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Website updated successfully' });
    } catch (error) {
        console.error('Error updating website:', error.message);
        res.status(500).json({ message: 'Error updating website', error: error.message });
    }
});

// Function to recheck and send email if still down
const recheckWebsiteStatus = async (website) => {
    setTimeout(async () => {
        const status = await checkWebsiteStatus(website);

        if (status === 'down') {
            const currentTime = new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });

            const mailOptions = {
                from: process.env.EMAIL_USER, 
                to: website.email,
                subject: `${website.name} is down`,
                text: `The ${website.name} (${website.url}) is still down after recheck at ${currentTime} IST.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Recheck Email sent:', info.response);
                }
            });
        }
    }, 60 * 1000); // Recheck after 1 minute
};

// API route to check status of websites
app.get('/checkStatus', async (req, res) => {
    const { data: websites } = await supabase.from('Websites').select('*');

    websites.forEach(async (website) => {
        const status = await checkWebsiteStatus(website);

        if (status === 'down' && website.status === 'up') {
            await supabase
                .from('Websites')
                .update({ status: 'down' })
                .eq('id', website.id);

            await supabase
                .from('DownWebsites')
                .insert([{ url: website.url, name: website.name, email: website.email }]);

            recheckWebsiteStatus(website);
        } else if (status === 'up' && website.status === 'down') {
            await supabase
                .from('Websites')
                .update({ status: 'up' })
                .eq('id', website.id);

            console.log(`${website.name} is back up.`);
        }
    });

    res.status(200).json({ message: 'Status check complete' });
});

// API route to check if the database is connected
app.get('/checkDatabase', async (req, res) => {
    try {
        const { data, error } = await supabase.from('Websites').select('id').limit(1);

        if (error) {
            throw new Error('Database not connected');
        }

        res.status(200).json({ message: 'Database connected' });
    } catch (error) {
        res.status(500).json({ message: 'Database not connected' });
    }
});
let checkInterval = 600000; // Default to 10 minutes (600000 ms)

// API route to update the check interval
app.post('/updateInterval', (req, res) => {
    console.log("changed");
    const { interval } = req.body;

    if (interval && typeof interval === 'number') {
        checkInterval = interval * 60 * 1000; // Convert minutes to milliseconds
        res.status(200).json({ message: 'Interval updated successfully', checkInterval });
    } else {
        res.status(400).json({ message: 'Invalid interval value' });
    }
});


// Use the updated interval in the setInterval call
setInterval(async () => {
    await axios.get('http://localhost:5000/checkStatus');
}, checkInterval);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
