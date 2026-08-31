static async getJobSeekersForEmployer(req, res) {
        try {
            const employerId = req.user.uid;
            const jobSeekers = await JobsService.getJobSeekersForEmployer(employerId);
            return res.status(200).json(jobSeekers);
        } catch (error) {
            console.error('Error in getJobSeekersForEmployer controller:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

export default JobController;