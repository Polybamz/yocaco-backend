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
            const jobsdistribution = {
                "full-time": 0, 
                'part-time': 0,
                'contract': 0,
                'internship': 0,
                'temporary': 0
            };
            jobsSnapshot.forEach(doc => {
                jobs.push({...doc.data(), id: doc.id});
            });
            // UPDATING JOB DISTRIBUTION
            jobs.forEach(job => {
                if (jobsdistribution[job.type] !== undefined) {
                    jobsdistribution[job.type] += 1;
                }
            });
            // JOB DISTRIBUTION IN LAST SIX MONTHS FROM CURRENT DATE
            const jobsdistributionInLastSixMonths = {}
            const currentDate = new Date();
            for (let i = 0; i < 6; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const jobsInMonth = jobs.filter(job => {
                    const jobDate = new Date(job.createdAt);
                    return jobDate.getMonth() === month.getMonth() && jobDate.getFullYear() === month.getFullYear();
                });
                // COUNT PER MONTH
                jobsdistributionInLastSixMonths[month.toLocaleString('default', { month: 'long', year: 'numeric' })] = jobsInMonth.length;
            }
            const jobsCount = jobs.length;
            const activeJobsCount = jobs.filter(job => job.status === 'active').length;
            // console.log("Jobs Distribution in Last Six Months:", jobsdistributionInLastSixMonths);
            return {JOBS: jobs, jobsdistribution: jobsdistribution, jobsdistributionInLastSixMonths: jobsdistributionInLastSixMonths, jobsCount: jobsCount, activeJobsCount: activeJobsCount  };
            } catch (error) {
            // console.error("Error fetching jobs:", error);
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