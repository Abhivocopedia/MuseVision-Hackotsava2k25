const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Analytics storage
let analyticsData = {
    scans: [],
    visitors: new Set()
};

// Routes
app.post('/api/scan', (req, res) => {
    try {
        const scanData = {
            ...req.body,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        
        analyticsData.scans.push(scanData);
        analyticsData.visitors.add(scanData.visitorId);
        
        console.log('Scan recorded:', scanData.artworkName);
        res.json({ success: true, id: scanData.id });
    } catch (error) {
        console.error('Error recording scan:', error);
        res.status(500).json({ success: false, error: 'Failed to record scan' });
    }
});

app.get('/api/analytics/dashboard', (req, res) => {
    try {
        const mostScanned = getMostScannedArtworks();
        const dwellStats = getDwellTimeStats();
        
        res.json({
            totalVisitors: analyticsData.visitors.size,
            totalScans: analyticsData.scans.length,
            mostScannedArtworks: mostScanned,
            averageDwellTime: dwellStats.average,
            popularMuseums: getPopularMuseums()
        });
    } catch (error) {
        console.error('Error generating dashboard:', error);
        res.status(500).json({ error: 'Failed to generate dashboard' });
    }
});

app.get('/api/artworks', (req, res) => {
    const artworks = [
        {
            id: '1',
            name: 'Mona Lisa',
            era: 'Renaissance',
            artist: 'Leonardo da Vinci',
            description: 'Famous portrait painting known for its enigmatic smile.',
            museum: 'Louvre'
        },
        {
            id: '2', 
            name: 'Starry Night',
            era: 'Post-Impressionism',
            artist: 'Vincent van Gogh',
            description: 'Iconic painting depicting a swirling night sky.',
            museum: 'MoMA'
        }
    ];
    
    res.json({ success: true, artworks });
});

// Helper functions
function getMostScannedArtworks() {
    const counts = {};
    analyticsData.scans.forEach(scan => {
        counts[scan.artworkName] = (counts[scan.artworkName] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
}

function getDwellTimeStats() {
    return {
        average: '2.5 minutes',
        max: '15 minutes',
        min: '30 seconds'
    };
}

function getPopularMuseums() {
    const museumCounts = {};
    analyticsData.scans.forEach(scan => {
        museumCounts[scan.museum] = (museumCounts[scan.museum] || 0) + 1;
    });
    
    return Object.entries(museumCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([museum, count]) => ({ museum, count }));
}

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MuseVersion server running on port ${PORT}`);
    console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics/dashboard`);
});