import { db,admin } from "../../config/config.js";


class TestimonialsService {
  async addTestimonial(testimonialData) {
  try {
  const testimonialRef = db.collection('testimonials').doc();
    await testimonialRef.set(testimonialData);
    return { id: testimonialRef.id, ...testimonialData };

  } catch (error) {
    throw new Error("Error adding testimonial: " + error.message);}
  }

    async getAllTestimonials() {
    try {
      const testimonials = await db.collection('testimonials').get();
      return testimonials.docs.map((testimonial) => {
        return { id: testimonial.id,...testimonial.data() };
      });
    } catch (error) {
      throw new Error("Error getting all testimonials: " + error.message);
    }
  }

  async getTestimonialById(id) {
    try {
      const testimonial = await db.collection('testimonials').doc(id).get();
      if (testimonial.exists) {
        return { id: testimonial.id,...testimonial.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Error getting testimonial by id: " + error.message);
    }
  }

  async updateTestimonial(id, testimonialData) {
    try {
      const testimonialRef = db.collection('testimonials').doc(id);
      await testimonialRef.update(testimonialData);
      return { id: testimonialRef.id,...testimonialData };
    } catch (error) {
        throw new Error("Error updating testimonial: " + error.message);
    }
  }

  async deleteTestimonial(id) {
    try {
      const testimonialRef = db.collection('testimonials').doc(id);
      await testimonialRef.delete();
      return { id: testimonialRef.id };
    } catch (error) {
      throw new Error("Error deleting testimonial: " + error.message);
    }
  }
}

export default TestimonialsService;

 