import Joi from 'joi'

const testimonialSchema = Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required(),
      company: Joi.string().required(),
      content: Joi.string().required()
})

export default testimonialSchema;