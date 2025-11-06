import Joi from 'joi';

const articleSchema = Joi.object({
    // Corresponds to the text input for the main title
    title: Joi.string()
        .max(100) // Added a reasonable maximum length
        .required(),

    // Corresponds to the textarea for the short summary
    excerpt: Joi.string()
        .max(150) // Matches the max length set in the component (150 chars)
        .required(),

    // Corresponds to the rich text editor (TinyMCE HTML output)
    article: Joi.string() 
        .required(), 

    // Metadata Fields
    // Allows null, empty string, or absence (undefined)
    author: Joi.string()
        .allow(null, ''), 

    // Example: "8 min read"
    readTime: Joi.string()
        .allow(null, ''), 

    // Date input: expecting a string that represents a valid date (e.g., "2024-08-10")
    date: Joi.date()
        .iso() // Ensures the date is in ISO 8601 format (like YYYY-MM-DD)
        .allow(null),

    category: Joi.string()
        .required(),

    // Image: An array of strings (URLs). Allows null or an empty array.
    image: Joi.array()
        .items(Joi.string()) // Ensures items are strings and valid URIs
        .allow(null)
        .default([]),

    // Tags: An array of strings (parsed from the comma-separated input)
    tags: Joi.array()
        .items(Joi.string())
        .min(1) // Requires at least one tag
        .required(),

    // Status: One of "draft", "published", or "archived"
    status: Joi.string()
        .valid('draft', 'published', 'archived')
        .required(),
    /// catigory
   type: Joi.string().valid('tiib', 'coaching').required()
});

/**
 * Validates the article data object against the Joi schema.
 * * @param {object} articleData - The article data object to validate.
 * @returns {object} The result object containing `error` (Joi.ValidationError or null) and `value` (validated data).
 */
export const validateArticle = (articleData) => {
    // Setting abortEarly: false ensures that all validation errors are collected and returned
    return articleSchema.validate(articleData, { abortEarly: false });
};

// Export the schema definition itself (often useful for documentation/tools)
export default articleSchema;
