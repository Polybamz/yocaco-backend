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
            const jobRef = db.collection('jobs').doc(jobId);
            const jobDoc = await jobRef.get();
            if (!jobDoc.exists) {
                return null;
            }
            const job = jobDoc.data();
            let boostedUntil = null;
            if (job.boosted) {
                boostedUntil = new Date(new Date().getTime() + job.boosted * 24 * 60 * 60 * 1000).toISOString();
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
static async getJobSuggestionsForSeeker(userId) {
         try {
             // Get the job seeker's profile
             const seekerProfileDoc = await db.collection('jobSeekerProfiles').doc(userId).get();
             if (!seekerProfileDoc.exists) {
                 // If no profile found, return empty array
                 return [];
             }
             const seekerProfile = seekerProfileDoc.data();

             // Extract seeker's skills, experience, location
             let seekerSkills = [];
             if (seekerProfile.skills) {
                 seekerSkills = seekerProfile.skills
                     .split(',')
                     .map(skill => skill.trim().toLowerCase())
                     .filter(skill => skill.length > 0);
             }
             const seekerExperience = seekerProfile.experience || ''; // e.g., '5-7', '8-10'
             const seekerLocation = seekerProfile.location ? seekerProfile.location.toLowerCase() : '';

             // Get all approved jobs
             const jobsSnapshot = await db.collection('jobs').where('status', '==', 'approved').get();
             if (jobsSnapshot.empty) {
                 return [];
             }

             const suggestedJobs = [];
             jobsSnapshot.forEach(doc => {
                 const job = { ...doc.data(), id: doc.id };

                 // Skip if job doesn't have required fields we need for matching
                 if (!job.title) return;

                 let match = false;

                 // 1. Location matching (if seeker has location and job has location)
                 if (seekerLocation && job.location) {
                     const jobLocation = job.location.toLowerCase();
                     if (jobLocation === seekerLocation) {
                         match = true;
                     }
                 }
                 // If seeker has no location, we don't filter by location (show all)

                 // 2. Skills matching
                 if (seekerSkills.length > 0) {
                     let skillsMatch = false;
                     // Check if job has requiredSkills as string
                     if (job.requiredSkills && typeof job.requiredSkills === 'string') {
                         const jobSkillsLower = job.requiredSkills.toLowerCase();
                         seekerSkills.forEach(skill => {
                             if (jobSkillsLower.includes(skill)) {
                                 skillsMatch = true;
                             }
                         });
                     }
                     // Check if job has requiredSkills as array
                     else if (job.requiredSkills && Array.isArray(job.requiredSkills)) {
                         const jobSkillsLower = job.requiredSkills.map(skill => 
                             typeof skill === 'string' ? skill.toLowerCase() : ''
                         );
                         seekerSkills.forEach(skill => {
                             if (jobSkillsLower.includes(skill)) {
                                 skillsMatch = true;
                             }
                         });
                     }
                     // If no requiredSkills field, we can't match by skills
                     else {
                         skillsMatch = false;
                     }

                     // If seeker has skills but no match, skip this job
                     if (!skillsMatch) {
                         return;
                     }
                     // If we got here, skills matched
                     match = true;
                 }
                 // If seeker has no skills, we don't filter by skills

                 // 3. Experience matching (optional, skip for now)
                 // We could add experience matching here if we have a standard format

                 // If we have a match (by location and/or skills, or if no filters are applied), add to suggestions
                 if (match || (seekerSkills.length === 0 && (!seekerLocation || !job.location))) {
                     suggestedJobs.push(job);
                 }
             });

             // Sort by boosted descending (if available) or by createdAt descending
             suggestedJobs.sort((a, b) => {
                 const boostedA = a.boosted || 0;
                 const boostedB = b.boosted || 0;
                 if (boostedA !== boostedB) {
                     return boostedB - boostedA;
                 }
                 const dateA = new Date(a.createdAt || 0);
                 const dateB = new Date(b.createdAt || 0);
                 return dateB - dateA;
             });

             // Limit to 10 suggestions
             return suggestedJobs.slice(0, 10);
         } catch (error) {
             console.error('Error in getJobSuggestionsForSeeker:', error);
             throw error;
         }
     }
// Get job seekers for an employer based on their jobs
    static async getJobSeekersForEmployer(employerId) {
        try {
            // Get the employer's approved jobs (limit to 5 to avoid too much processing)
            const jobsSnapshot = await db.collection('jobs')
                .where('employerId', '==', employerId)
                .where('status', '==', 'approved')
                .limit(5)
                .get();

            if (jobsSnapshot.empty) {
                return []; // No jobs, no suggestions
            }

            // Fetch a batch of job seeker profiles (we'll limit to 100 for performance)
            const jobSeekersSnapshot = await db.collection('jobSeekerProfiles').limit(100).get();
            if (jobSeekersSnapshot.empty) {
                return [];
            }

            // We'll store job seekers by their uid to avoid duplicates
            const jobSeekerMatches = new Map(); // key: uid, value: { profile, matchCount }

            jobsSnapshot.forEach(jobDoc => {
                const job = jobDoc.data();
                // Normalize job location and skills for matching
                const jobLocation = job.location ? job.location.toLowerCase() : null;
                let jobSkills = [];
                if (job.requiredSkills) {
                    if (typeof job.requiredSkills === 'string') {
                        jobSkills = job.requiredSkills
                            .split(',')
                            .map(skill => skill.trim().toLowerCase())
                            .filter(skill => skill.length > 0);
                    } else if (Array.isArray(job.requiredSkills)) {
                        jobSkills = job.requiredSkills
                            .map(skill => typeof skill === 'string' ? skill.trim().toLowerCase() : '')
                            .filter(skill => skill.length > 0);
                    }
                }

                jobSeekersSnapshot.forEach(seekerDoc => {
                    const seeker = seekerDoc.data();
                    const seekerUid = seekerDoc.id;

                    // Skip if we don't have a uid (shouldn't happen)
                    if (!seekerUid) return;

                    // Get current match count for this seeker
                    const current = jobSeekerMatches.get(seekerUid) || { profile: seeker, matchCount: 0 };

                    // Check location match
                    let locationMatch = true;
                    if (jobLocation) {
                        const seekerLocation = seeker.location ? seeker.location.toLowerCase() : null;
                        locationMatch = (seekerLocation === jobLocation);
                    }

                    // Check skills match
                    let skillsMatch = true;
                    if (jobSkills.length > 0) {
                        const seekerSkillsStr = seeker.skills || '';
                        const seekerSkills = seekerSkillsStr
                            .split(',')
                            .map(skill => skill.trim().toLowerCase())
                            .filter(skill => skill.length > 0);
                        skillsMatch = jobSkills.some(jobSkill => seekerSkills.includes(jobSkill));
                    }

                    // If both location and skills match, then this job is a match for the seeker
                    if (locationMatch && skillsMatch) {
                        current.matchCount += 1;
                        jobSeekerMatches.set(seekerUid, current);
                    }
                });
            });

            // Convert the map to an array and sort by matchCount descending
            const jobSeekersArray = Array.from(jobSeekerMatches.values())
                .filter(item => item.matchCount > 0) // Only include those with at least one match
                .sort((a, b) => b.matchCount - a.matchCount)
                .slice(0, 10) // Top 10
                .map(item => item.profile);

            return jobSeekersArray;
        } catch (error) {
            console.error('Error in getJobSeekersForEmployer:', error);
            throw error;
        }
    }

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
APPENDED_MARKER