import Joi from 'joi'

// Public contact form submission (career-quest-tiib-24 /contact page)
export const contactMessageSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().allow('').max(40).optional(),
  subject: Joi.string().trim().min(2).max(200).required(),
  message: Joi.string().trim().min(10).max(5000).required(),
})

// Admin-side updates (mark as read)
export const contactUpdateSchema = Joi.object({
  isRead: Joi.boolean().required(),
})

export default contactMessageSchema