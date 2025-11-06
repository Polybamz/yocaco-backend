import Joi from "joi";
const subscribtionSchema = Joi.object({
     employerId: Joi.string().required(),
     plan: Joi.string().valid('basic', 'standard', 'premium').required(),
     startDate: Joi.date().required(),
     endDate: Joi.date().required(),
     duration: Joi.number().required(),
     status: Joi.string().valid('active', 'expired').required()
});

export default subscribtionSchema;