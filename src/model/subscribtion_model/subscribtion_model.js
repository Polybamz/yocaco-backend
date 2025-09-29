import Joi from "joi";
const subscribtionSchema = Joi.object({
     employerId: Joi.string().required(),
     plan: Joi.string().valid('basic', 'standard', 'premium').required(),
     startDate: Joi.date().required(),
     endDate: Joi.date().required(),
     status: Joi.string().valid('active', 'inactive').required()
});

export default subscribtionSchema;