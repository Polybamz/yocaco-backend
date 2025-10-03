import Joi from 'joi';

const profileSchema = Joi.object({
    userId: Joi.string().required(),
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    location: Joi.string().required(),
    education: Joi.string().required(),
    university: Joi.string().required(),
    graduationYear: Joi.number().required(),
    experience: Joi.string().valid("5-7","8-10","11-15","15+").required(),
    skills: Joi.string().required(),
    certifications: Joi.string().required(),
    linkedinUrl: Joi.string().allow(null),
    portfolioUrl: Joi.string().allow(null),
    summary: Joi.string().required(),
    hasMinimumRequirements: Joi.boolean().allow(null).default(false),
});


const validateProfile = (profile) => {
    return profileSchema.validate(profile);
}

export default validateProfile;
