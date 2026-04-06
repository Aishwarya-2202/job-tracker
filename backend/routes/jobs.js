const express = require('express')
const router = express.Router()
const multer = require('multer')
const supabase = require('../db/supabase')
const { verifyToken } = require('../middleware/authMiddleware')

// Multer stores file in memory temporarily before we send to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'), false)
    }
  }
})

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

// ADD a new job application (with optional resume)
router.post('/', verifyToken, upload.single('resume'), async (req, res) => {
  const {
    company_name, role_applied, date_applied, status,
    job_description, test_date, source, notes
  } = req.body

  let resume_filename = null
  let resume_url = null

  // If a file was uploaded, send it to Supabase Storage
  if (req.file) {
    const fileName = `${req.user.id}_${Date.now()}_${req.file.originalname}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      return res.status(500).json({ error: 'Resume upload failed: ' + uploadError.message })
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    resume_filename = req.file.originalname
    resume_url = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('job_applications')
    .insert([{
      user_id: req.user.id,
      company_name, role_applied, date_applied, status,
      job_description, test_date, source, notes,
      resume_filename, resume_url
    }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// UPDATE a job application (with optional new resume)
router.put('/:id', verifyToken, upload.single('resume'), async (req, res) => {
  const { id } = req.params

  const updateData = { ...req.body }

  if (req.file) {
    const fileName = `${req.user.id}_${Date.now()}_${req.file.originalname}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      return res.status(500).json({ error: 'Resume upload failed: ' + uploadError.message })
    }

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    updateData.resume_filename = req.file.originalname
    updateData.resume_url = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', req.user.id)
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