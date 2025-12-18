import Joi from "joi";
const subscribtionSchema = Joi.object({
     employerId: Joi.string().required(),
     plan: Joi.string().valid('Starter','Professional','Enterprise').required(),
     startDate: Joi.date().required(),
     endDate: Joi.date().required(),
     duration: Joi.number().required(),
     status: Joi.string().valid('active', 'expired','pending').default('pending'),
     transactionId: Joi.string().required(),
});

export default subscribtionSchema;