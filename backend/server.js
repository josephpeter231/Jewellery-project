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
    api_key: 'b00c9cdfba3d779fc42fb3142fe431d741fdef7ecb11d58d744c04fae78502c1',
    engine: 'google_lens',
    url: imageUrl,
  };

  try {
    const response = await axios.get('https://serpapi.com/search', { params });
    const visualMatches = response.data.visual_matches || [];

    const imageLinks = visualMatches
      .map(match => match.image)
      .filter(link => !!link)
      .slice(0,20);

    // Save to DB
    const savedRecord = new ReverseImage({
      inputImage: imageUrl,
      outputImages: imageLinks
    });

    await savedRecord.save();

    res.json({ images: imageLinks });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch reverse image results' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 
