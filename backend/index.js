const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const jobRoutes = require('./routes/jobs')
const adminRoutes = require('./routes/admin')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://job-tracker-chi-two.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/admin', adminRoutes)

// Test route — just to confirm server is running
app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})