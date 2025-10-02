import JobsService from "../../services/job_ser/job_ser.js";
import {validateJob} from "../../model/jobs_ser/jobs_ser.js";

class JobController {
    static async createJob(req, res) {
        try {
            const jobData = req.body;
            const { error } = validateJob(jobData);
            if (error) return res.status(400).json({ message: error.details[0].message });
            const job = await JobsService.createJobs(jobData);
            return res.status(201).json({ message: "Job created successfully", job });
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    static async getAllJobs(req, res) {
        try {
            const jobs = await JobsService.getAllJobs();
            return res.status(200).json(jobs);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    static async deleteJobById(req, res) {
        try {
            const { jobId } = req.params;
            const job = await JobsService.deleteJobById(jobId);
            if (!job) return res.status(404).json({ message: "Job not found" });
            return res.status(200).json({ message: "Job deleted successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    static async updateJobStatus(req, res) {
        try {
            const  { id:jobId } = req.params;
            console.log("For job ID:", jobId);
            console.log("Request body:", req.body);
            const  status  = req.body.status;
            console.log("Updating job status to:", status);
            
            const job = await JobsService.updateJobStatus(jobId, status);
            if (!job) return res.status(404).json({ message: "Job not found" });
            return res.status(200).json({ message: "Job status updated successfully" });
        } catch (error) {
            return res.status(500).json({
                error: error.message,
                message: "Internal Server Error" });
        }
    }
    static async updateJob(req, res) {
        try {
            const { jobId } = req.params;
            const jobData = req.body;
            const { error } = validateJob(jobData);
            if (error) return res.status(400).json({ message: error.details[0].message });
            const job = await JobsService.updateJob(jobId, jobData);
            if (!job) return res.status(404).json({ message: "Job not found" });
            return res.status(200).json({ message: "Job updated successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async getJobByEmployerId(req, res) {
        try {
            const { employerId } = req.params;
            const jobs = await JobsService.getJobByEmployerId(employerId);
            if (!jobs || jobs.length === 0) return res.status(404).json({ message: "No jobs found for this employer" });
            return res.status(200).json(jobs);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

}

export default JobController;