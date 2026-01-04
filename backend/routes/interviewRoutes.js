// server/routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const MockInterview = require('../models/MockInterview'); 
const axios = require('axios'); 
const moment = require('moment');

router.post('/generate', async (req, res) => {
    const { jobPosition, jobDescription, questionCount, type } = req.body;

    try {
        // Call Python Microservice
        const aiResponse = await axios.post('http://127.0.0.1:5001/generate_questions', {
            jobPosition,
            jobDescription,
            questionCount,
            type
        });

        if (aiResponse.data.success) {
            // Save to MongoDB
            const mockInterview = new MockInterview({
                jsonMockResp: aiResponse.data.questions,
                jobPosition,
                jobDesc: jobDescription,
                jobExperience: questionCount.toString(),
                createdAt: moment().format('DD-MM-YYYY'),
                createdBy: "User"
            });

            const savedInterview = await mockInterview.save();
            
            res.json({
                success: true,
                id: savedInterview._id 
            });
        } else {
            res.status(500).json({ message: "Failed to fetch questions" });
        }

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const interview = await MockInterview.findById(req.params.id);
        res.json({
            jobPosition: interview.jobPosition,
            questions: interview.jsonMockResp,
            createdAt: interview.createdAt
        });
    } catch (error) {
        res.status(404).json({ message: "Not found" });
    }
});

// Add this BEFORE the router.get('/:id', ...) route

// GET: Get ALL Interviews for the dashboard list
router.get('/all', async (req, res) => {
    try {
        // Find all, sort by newest first (-1 means descending order)
        const interviews = await MockInterview.find().sort({ createdAt: -1 });
        
        // Map data to simpler format for dashboard list
        const formattedInterviews = interviews.map(item => ({
            _id: item._id,
            jobPosition: item.jobPosition,
            jobDesc: item.jobDesc,
            createdAt: item.createdAt,
            // Assuming you saved the questions array, we can count its length
            questionsLength: item.jsonMockResp ? item.jsonMockResp.length : 0
        }));

        res.json({ success: true, interviews: formattedInterviews });
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;