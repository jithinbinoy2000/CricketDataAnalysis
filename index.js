require('dotenv').config();
const cors = require('cors');
const express = require('express');
const axios = require('axios');
const jsdom = require('jsdom');
const https = require('https');
const app = express();
const { JSDOM } = jsdom;
const PORT = 3001;

app.use(cors());
app.use(express.json());

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

let Data = [];

const getData = async () => {
  try {
    const response = await axiosInstance.get(process.env.WEBURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'axios/1.7.2',
        'Accept-Encoding': 'gzip, compress, deflate, br',
        'Host': 'www.espncricinfo.com',
        'Connection': 'close'
      },
      httpsAgent: new https.Agent({ keepAlive: false })
    });

    const { document } = new JSDOM(response.data).window;
    const table = document.querySelector('table');

    if (!table) {
      console.error('Table not found in the document');
      return null;
    }

    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const newData = {
          team1: cells[0]?.textContent.trim() || '',
          team2: cells[1]?.textContent.trim() || '',
          Winner: cells[2]?.textContent.trim() || '',
          Margin: cells[3]?.textContent.trim() || '',
          Ground: cells[4]?.textContent.trim() || '',
          MatchDate: cells[5]?.textContent.trim() || '',
          Scorecard: cells[6]?.textContent.trim() || ''
        };
        Data.push(newData);
      }
    });

    return Data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

app.get('/', async (req, res) => {
  const data = await getData();

  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
