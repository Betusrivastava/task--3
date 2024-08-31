const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');


const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/crypto-transactions', { useNewUrlParser: true, useUnifiedTopology: true });


const transactionSchema = new mongoose.Schema({
  address: String,
  gasUsed: Number,
  gasPrice: Number,
  timestamp: Date
});
const Transaction = mongoose.model('Transaction', transactionSchema);


const fetchEtherPrice = async () => {
  try {
    const response = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'stats',
        action: 'ethprice',
        apikey: 'YOUR_ETHERSCAN_API_KEY'
      }
    });
    return response.data.result.ethusd;
  } catch (error) {
    console.error('Error fetching Ether price:', error);
    throw error;
  }
};


app.get('/expenses/:address', async (req, res) => {
  const { address } = req.params;
  try {
    
    const transactions = await Transaction.find({ address });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this address' });
    }


    const totalExpenses = transactions.reduce((sum, tx) => sum + (tx.gasUsed * tx.gasPrice / 1e18), 0);

   
    const etherPrice = await fetchEtherPrice();

    res.json({
      address,
      totalExpenses,
      currentEtherPrice: etherPrice
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving data', error });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
