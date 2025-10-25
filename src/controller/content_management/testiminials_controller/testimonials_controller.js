import TestimonialsService from "../../../services/content_manamet_ser/testimonials_ser.js";
import testimonialSchema from "../../../model/content_management_model/testimonials_model.js";


class TestimonialController {
static addTestimonial = async (req, res) => {
    try {
        const data = req.body
        const {error, value} = testimonialSchema.validate(data)
        if(error) throw Error(error);
     const result =  await TestimonialsService.addTestimonial(value)
     return res.status(200).json({success: true, data:result})
    } catch (er){
        console.log(er)
        return res.status(500).json({success:false, error: er.message})

    }

}
///  get testimonials 
static getTestimonials = async (req,res) => {
    try {
        const result = await TestimonialsService.getTestimonials();
        return res.status(200).json({
            success:true,
            data:result
        })
    } catch (er){
        console.log(er)
        return res.status(400).json({
            success: false,
            error: er.message
        })
    }

}
/// update testimonials
static updateTestimonials = async (req, res) => {
    const data = req.body;
    const {id} = req.params;
    try {
         const {error, value} = testimonialSchema.validate(data)
         if(error) throw new Error(error)
          const result =  await TestimonialsService.updateTestimonials(id, value);
        return res.status(200).json({
            success:true,
            message: 'Testimonial updated successfully',
            data: result
        })
  
    } catch (er){
        console.log(er)
        return res.status(400).json({
            success:false,
            error:er.message
        })
    }

}
// delete testimonials
static async deleteTestimonials(req,res){
    try{
        const {id} = req.params
      const result =  await TestimonialsService.deleteTestimonials(id)
      return res.status(200).json({
        success:true,
        data:result
      })
    } catch (er){
        console.log(er)
        return res.status(400).json({
            success:false,
            error: er.message
        })
    }
}
}

export default TestimonialController;