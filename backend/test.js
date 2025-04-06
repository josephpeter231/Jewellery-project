const axios = require('axios');

const params = {
  api_key: 'b00c9cdfba3d779fc42fb3142fe431d741fdef7ecb11d58d744c04fae78502c1',
  engine: 'google_lens',
  url: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRM0mIsPYWySDt5j0vJVtWPQZ1r7Sz4P4ULA8HiFugErLyTfRSuYCNzFrh3iDqRWIM1v2vC2S32K_EyojBcQ83XXD58p-W4K227WU9Zd3dRKt4xiN0ATThqww'
};

axios.get('https://serpapi.com/search', { params })
  .then(response => {
    const visualMatches = response.data.visual_matches || [];
    const imageLinks = visualMatches
      .map(match => match.image)
      .filter(link => !!link)
      .slice(0, 10);

    console.log('Top 5 Image Links:');
    imageLinks.forEach((link, i) => {
      console.log(`${i + 1}: ${link}`);
    });
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
