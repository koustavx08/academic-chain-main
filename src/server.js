import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Institution from './models/Institution.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root API route
app.get('/api', (req, res) => {
  res.json({ message: 'Academic Credentials API is running' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Institution routes
app.post('/api/institutions', async (req, res) => {
  try {
    const { address, registeredBy } = req.body;

    // Validate input
    if (!address || !registeredBy) {
      return res.status(400).json({ 
        message: 'Address and registeredBy are required' 
      });
    }

    // Check if institution already exists
    const existingInstitution = await Institution.findOne({ address });
    if (existingInstitution) {
      return res.status(409).json({ 
        message: 'Institution already registered' 
      });
    }

    // Create new institution
    const institution = new Institution({
      address,
      registeredBy,
    });

    await institution.save();
    res.status(201).json(institution);
  } catch (error) {
    console.error('Error registering institution:', error);
    res.status(500).json({ 
      message: 'Failed to register institution',
      error: error.message 
    });
  }
});

app.get('/api/institutions', async (req, res) => {
  try {
    const institutions = await Institution.find({ isActive: true });
    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch institutions',
      error: error.message 
    });
  }
});

app.delete('/api/institutions/:address', async (req, res) => {
  try {
    const institution = await Institution.findOne({ address: req.params.address });
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }
    institution.isActive = false;
    await institution.save();
    res.json({ message: 'Institution removed successfully' });
  } catch (error) {
    console.error('Error removing institution:', error);
    res.status(500).json({ 
      message: 'Failed to remove institution',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 