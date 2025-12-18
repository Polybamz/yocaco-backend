import { db, admin } from "../../config/config.js";

class JobsService {
    static async createJobs(job) {
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

    static async getAllJobs() {
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
                jobs.push({ ...doc.data(), id: doc.id });
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
            const activeJobsCount = jobs.filter(job => job.status === 'approved').length;
            // console.log("Jobs Distribution in Last Six Months:", jobsdistributionInLastSixMonths);
            return { JOBS: jobs, jobsdistribution: jobsdistribution, jobsdistributionInLastSixMonths: jobsdistributionInLastSixMonths, jobsCount: jobsCount, activeJobsCount: activeJobsCount };
        } catch (error) {
            // console.error("Error fetching jobs:", error);
            throw new Error(error);
        }
    }

     // get aproed jobs in ordered by boosted so that all with boosted come first
     static async getApprovedJobsOrderedByBoosted() {
        try {
            const jobsSnapshot = await db.collection('jobs').where('status', '==', 'approved').orderBy('boosted', 'desc').get();
            const jobs = [];
            jobsSnapshot.forEach(doc => {
                jobs.push({ ...doc.data(), id: doc.id });
            });
            return jobs;
        } catch (error) {
            console.error("Error fetching approved jobs:", error);
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
            const currentDate = Date()
            const jobRef = db.collection('jobs').doc(jobId);
              const jobDoc = await jobRef.get();
              if (!jobDoc.exists) {
                    return null;
                }
               const job = jobRef.data()
               const boostedUntil = null
               if(job.boosted){
                  boostedUntil = new Date(currentDate.getTime() + job.boosted * 24 * 60 * 60 * 1000).toISOString();
               }
            await jobRef.update({
                status,
                boostedUntil,
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

    // update status after expired date
    static updateExpiredJobsStatus = async () => {
        try {
            const currentDate = new Date();
            const jobsSnapshot = await db.collection('jobs').where('status', 'in', ['approved', 'pending']).get();
            const batch = db.batch();
            jobsSnapshot.forEach(doc => {
                const job = doc.data();
                const jobDate = new Date(job.expiryDate);
                if (jobDate < currentDate) {
                    const jobRef = db.collection('jobs').doc(doc.id);
                    batch.update(jobRef, { status: 'expired', updatedAt: new Date().toISOString() });
                }

            })
            // return number of updated jobs
            await batch.commit();
            return jobsSnapshot.size;
        } catch (error) {
            console.error("Error updating expired jobs status:", error);
            // throw  Error(error);
        }
    }
    // get jobs by status
    static getJobByStatus = async (status) => {
        console.log("statussssssssssssssssssss", status);
        try {
            const jobsSnapshot = await db.collection('jobs').where('status', '==', status).get();
            const jobs = [];
            jobsSnapshot.forEach(doc => {
                jobs.push(doc.data());
            });
            return jobs;
        } catch (error) {
            console.error("Error fetching jobs by status:", error);
        }
    }


    // boost job
    static async boostJob(jobId, days, transactionId) {
        try {
            //   const jobRef = await db.collection('jobs').doc(jobId).get();
            //   if (!jobRef.exists) {
            //         return null;
            //     }
            //    const job = jobRef.data()
            const jobRef = db.collection('jobs').doc(jobId);
            await jobRef.update(
                {
                    boosted: days,
                    transactionId: transactionId,
                    updatedAt: Date()
                }
            )
            return { message: `Success, ` }

        } catch (er) {
            throw Error(er)
        }

    }

    //
    // Analytics functions

//
// Analytics functions
static  getJobAnalytics = async (employerId) => {
  try {
    const jobs = await this.getJobByEmployerId(employerId || '');

    // Normalize statuses used elsewhere in the service (approved/pending/denied/expired)
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'approved').length;
    const pendingJobs = jobs.filter(job => job.status === 'pending').length;
    const closedJobs = jobs.filter(job => job.status === 'denied').length;
    const expiredJobs = jobs.filter(job => job.status === 'expired').length;

    // Monthly job postings for the last 6 months (including current)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.getMonth();
      const yearKey = monthDate.getFullYear();
      const count = jobs.filter(job => {
        const created = job.createdAt ? new Date(job.createdAt) : null;
        if (!created || isNaN(created)) return false;
        return created.getMonth() === monthKey && created.getFullYear() === yearKey;
      }).length;
      monthlyData.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        year: monthDate.getFullYear(),
        jobs: count
      });
    }

    // Job type distribution (robust to missing/unknown types)
    const jobTypes = jobs.reduce((acc, job) => {
      const t = (job.type || 'unknown').toString();
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const typeData = Object.entries(jobTypes).map(([type, count]) => ({
      type: type.replace(/-/g, ' '),
      count,
    }));

    // Application stats (use job.applicationCount if present)
    const totalApplications = jobs.reduce((sum, job) => sum + (Number(job.applicationCount) || 0), 0);
    const averagePerJob = totalJobs ? Math.round(totalApplications / totalJobs) : 0;

    return {
      totalJobs,
      activeJobs,
      pendingJobs,
      closedJobs,
      expiredJobs,
      monthlyData,
      typeData,
      applicationStats: {
        totalApplications,
        averagePerJob,
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};
// ...existing code...
}

export default JobsService;