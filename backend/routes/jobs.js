const express = require('express')
const router = express.Router()
const supabase = require('../db/supabase')
const { verifyToken } = require('../middleware/authMiddleware')

// GET all jobs for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ADD a new job application
router.post('/', verifyToken, async (req, res) => {
  const {
    company_name, role_applied, date_applied, status,
    job_description, test_date, source, notes
  } = req.body

  const { data, error } = await supabase
    .from('job_applications')
    .insert([{
      user_id: req.user.id,
      company_name, role_applied, date_applied, status,
      job_description, test_date, source, notes
    }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// UPDATE a job application
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('job_applications')
    .update(req.body)
    .eq('id', id)
    .eq('user_id', req.user.id) // Security: users can only edit their own
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// DELETE a job application
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Deleted successfully' })
})

module.exports = router