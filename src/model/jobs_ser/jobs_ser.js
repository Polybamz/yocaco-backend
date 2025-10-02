import Joi from "joi";

    const jobSchema = Joi.object({
        title: Joi.string().required(),
        company: Joi.string().required(),
        logoUrl: Joi.string().required(), // New field
        location: Joi.string().required(),
        type: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'commission').required(),
        salary: Joi.string().allow(null),
        tags: Joi.array().items(Joi.string()).allow(null), // New field, will be converted to an array
        description: Joi.string().required(),
        requirements: Joi.string().required(),
        applyEmail: Joi.string().email().allow(null),
        applyLink: Joi.string().allow(null),
        expiryDate: Joi.date().required(),
        status: Joi.string().valid('pending', 'approved', 'denied', 'expired').required(),
        employerId: Joi.string().required(),
        boosted: Joi.boolean().allow(null),
        boostedUntil: Joi.date().allow(null),
    });

    const validateJob = (job) => {
        return jobSchema.validate(job);
    };
export { validateJob };