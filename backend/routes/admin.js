const express = require('express')
const router = express.Router()
const supabase = require('../db/supabase')
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware')

// POST a job link (admin only)
router.post('/jobs', verifyAdmin, async (req, res) => {
  const { job_title, company, job_link, description } = req.body

  const { data, error } = await supabase
    .from('admin_jobs')
    .insert([{ job_title, company, job_link, description }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// GET all admin-posted jobs (all logged-in users can view)
router.get('/jobs', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('admin_jobs')
    .select('*')
    .order('posted_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all users + their application counts (admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, status, role, created_at')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router