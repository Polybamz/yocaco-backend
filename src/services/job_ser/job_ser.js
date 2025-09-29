import { db, admin } from "../../config/config.js";

class JobsService {
    static async createJobs(job){
        try {
            const jobRef = db.collection('jobs').doc();
            await jobRef.set({
                ...job,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                id: jobRef.id
            });
            return { id: jobRef.id, ...job };
        } catch (error) {
            console.error("Error creating job:", error);
            throw new Error(error);
        }
    }

    static async getAllJobs(){
        try {
            const jobsSnapshot = await db.collection('jobs').get();
            const jobs = [];
            jobsSnapshot.forEach(doc => {
                jobs.push(doc.data());
            });
            return jobs;
            } catch (error) {
            console.error("Error fetching jobs:", error);
            throw new Error(error);
        }
        }   
   static getJobByEmployerId = async (employerId) => {
        try {
            const jobsSnapshot = await db.collection('jobs').where('employerId', '==', employerId).get();
            const jobs = [];
            jobsSnapshot.forEach(doc => {
                jobs.push(doc.data());
                });
            return jobs;
        } catch (error) {
            console.error("Error fetching jobs by employerId:", error);
            throw new Error(error);
        }
    };
// delete job by id
    static async deleteJobById(jobId) {
        try {
            await db.collection('jobs').doc(jobId).delete();
            return { message: 'Job deleted successfully' };
        } catch (error) {
            console.error("Error deleting job:", error);
            throw new Error(error);
        }
    }
    // update status of job by id
    static async updateJobStatus(jobId, status) {
        try {
            const jobRef = db.collection('jobs').doc(jobId);
            await jobRef.update({
                status,
                updatedAt: new Date().toISOString()
            });
            return { message: 'Job status updated successfully' };
        } catch (error) {
            console.error("Error updating job status:", error);
            throw new Error(error);
        }
    }

    // update job by id
    static async updateJob(jobId, job) {
        try {
            const jobRef = db.collection('jobs').doc(jobId);
            await jobRef.update({
                ...job,
                 updatedAt: new Date().toISOString()
            });
            return { message: 'Job updated successfully' };
        } catch (error) {
            console.error("Error updating job:", error);
            throw new Error(error);
        }
    }
   

}

export default JobsService;