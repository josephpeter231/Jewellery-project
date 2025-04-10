const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const ReverseImage = require('./models/ReverseImage');

const app = express();
const PORT = 5000;

mongoose.connect('mongodb+srv://josephpeterjece2021:AJ9Hg6xTtQBUCoGr@cluster1.xaacunv.mongodb.net/JewelleryProject?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.post('/reverse-image', async (req, res) => {
  const { imageUrl } = req.body;

  const params = {
    api_key: 'a4b8bbb22137b941e210cd14b524f6a9584cd873955c3e1f3bf65e3b8e26adf3',
    engine: 'google_lens',
    url: imageUrl,
  };

  try {
    const response = await axios.get('https://serpapi.com/search', { params });
    console.log('Response:', response.data);
    const visualMatches = response.data.visual_matches || [];

    const imageResults = visualMatches
      .map(match => ({
        image: match.image,
        price: match.price || null,
        title: match.title || '',
        link: match.link || '',
        source: match.source || ''
      }))
      .filter(item => !!item.image)
      .slice(0, 25);

    // Save to DB
    const savedRecord = new ReverseImage({
      inputImage: imageUrl,
      outputImages: imageResults.map(item => item.image)
    });

    await savedRecord.save();

    res.json({ results: imageResults });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch reverse image results' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

