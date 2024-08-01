require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const CompanyRoute = require('./routes/CompaniesRoute'); 
const app = express();
const PORT=process.env.PORT

const MONGO_URL = process.env.MONGO_URL; 

app.use(express.json());
app.use('/api/company',CompanyRoute);

app.get('/', (req, res) => {
    res.send('Hello node api');
});



mongoose.connect(MONGO_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Node API is running on port ${PORT}`);
        });
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log(error);
    });
