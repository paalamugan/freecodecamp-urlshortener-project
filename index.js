require('dotenv').config();
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const getDns = async (url) => {
  return new Promise((resolve, reject) => {
    const newUrl = new URL(url);
    dns.lookup(newUrl.hostname, (err, address, family) => {
      if (err) {
        reject(new Error('Invalid URL'));
      } else {
        resolve({address, family})
      }
    })
  })
}

const data = [];
// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  const { url } = req.body;
  try {
    if (!url) {
      throw new Error('Invalid URL');
    }
    const found = data.find((row) => row.original_url === url);

    if (found) {
      return res.json(found);
    }
    
    const address = await getDns(url);
    console.log("🚀 ~ file: index.js ~ line 41 ~ app.post ~ address", address)
    let result = {
      original_url: url, 
      short_url: data.length + 1
    }
    data.push(result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = +req.params.shortUrl;
  const found = data.find((row) => row.short_url === shortUrl);
  if (!found) {
    return res.status(404).json({ error: 'No short URL found for the given input' })
  }
  res.redirect(found.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
