const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../db/supabase')
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware')
require('dotenv').config()

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password_hash: hashedPassword }])
    .select()

  if (error) return res.status(400).json({ error: error.message })

  res.json({ message: 'Registered! Wait for admin approval.', user: data[0] })
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !users)
    return res.status(401).json({ error: 'Invalid email or password' })

  if (users.status === 'pending')
    return res.status(403).json({ error: 'Account pending admin approval' })

  const validPassword = await bcrypt.compare(password, users.password_hash)
  if (!validPassword)
    return res.status(401).json({ error: 'Invalid email or password' })

  const token = jwt.sign(
    { id: users.id, role: users.role, name: users.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: users.id, name: users.name, role: users.role } })
})

// GET all pending users (admin only)
router.get('/pending-users', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('status', 'pending')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// APPROVE user (admin only)
router.patch('/approve/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params

  const { data, error } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq('id', userId)
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'User approved', user: data[0] })
})

// GET current user profile
router.get('/me', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, status, created_at')
    .eq('id', req.user.id)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router