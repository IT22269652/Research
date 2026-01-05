const express = require('express');
const router = express.Router();
const ScheduledInterview = require('../models/ScheduledInterview');

// Helper function to generate Google Meet link
const generateGoogleMeetLink = (title, candidateName, candidateEmail, date, time, duration) => {
  // Format date and time for Google Calendar
  const interviewDate = new Date(date);
  const [hours, minutes] = time.split(':');
  interviewDate.setHours(parseInt(hours), parseInt(minutes), 0);
  
  // Calculate end time
  const endDate = new Date(interviewDate);
  endDate.setMinutes(endDate.getMinutes() + parseInt(duration));
  
  // Format dates for Google Calendar (ISO format without hyphens and colons)
  const startTime = interviewDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Create event details
  const eventTitle = encodeURIComponent(title);
  const eventDetails = encodeURIComponent(`Interview with ${candidateName}\n\nThis is an automated interview scheduling.`);
  const attendees = encodeURIComponent(candidateEmail);
  
  // Google Calendar link that will create an event with Google Meet
  const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startTime}/${endTime}&details=${eventDetails}&add=${attendees}&conference=1`;
  
  return googleCalendarLink;
};

// GET all scheduled interviews
router.get('/', async (req, res) => {
  try {
    const interviews = await ScheduledInterview.find()
      .sort({ date: 1, time: 1 })
      .lean();
    
    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    console.error('Error fetching scheduled interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled interviews',
      error: error.message
    });
  }
});

// GET single scheduled interview by ID
router.get('/:id', async (req, res) => {
  try {
    const interview = await ScheduledInterview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }
    
    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Error fetching scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled interview',
      error: error.message
    });
  }
});

// POST create new scheduled interview
router.post('/', async (req, res) => {
  try {
    const {
      title,
      candidateName,
      candidateEmail,
      date,
      time,
      duration,
      meetingLink,
      notes
    } = req.body;
    
    // Validation
    if (!title || !candidateName || !candidateEmail || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, candidateName, candidateEmail, date, time'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if date is in the future
    const interviewDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (interviewDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Interview date cannot be in the past'
      });
    }
    
    // Generate Google Meet link if no meeting link provided
    let finalMeetingLink = meetingLink;
    if (!finalMeetingLink) {
      finalMeetingLink = generateGoogleMeetLink(
        title,
        candidateName,
        candidateEmail,
        date,
        time,
        duration || 60
      );
    }
    
    // Create new scheduled interview
    const newInterview = new ScheduledInterview({
      title,
      candidateName,
      candidateEmail,
      date: interviewDate,
      time,
      duration: duration || 60,
      meetingLink: finalMeetingLink,
      notes,
      status: 'scheduled'
    });
    
    const savedInterview = await newInterview.save();
    
    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: savedInterview
    });
  } catch (error) {
    console.error('Error creating scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

// PUT update scheduled interview
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      candidateName,
      candidateEmail,
      date,
      time,
      duration,
      meetingLink,
      notes,
      status
    } = req.body;
    
    const interview = await ScheduledInterview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }
    
    // Update fields
    if (title) interview.title = title;
    if (candidateName) interview.candidateName = candidateName;
    if (candidateEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(candidateEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      interview.candidateEmail = candidateEmail;
    }
    if (date) interview.date = new Date(date);
    if (time) interview.time = time;
    if (duration) interview.duration = duration;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (notes !== undefined) interview.notes = notes;
    if (status) interview.status = status;
    
    interview.updatedAt = Date.now();
    
    const updatedInterview = await interview.save();
    
    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      interview: updatedInterview
    });
  } catch (error) {
    console.error('Error updating scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
      error: error.message
    });
  }
});

// DELETE scheduled interview
router.delete('/:id', async (req, res) => {
  try {
    const interview = await ScheduledInterview.findByIdAndDelete(req.params.id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully',
      interview
    });
  } catch (error) {
    console.error('Error deleting scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
      error: error.message
    });
  }
});

// GET upcoming interviews (interviews scheduled for today or future)
router.get('/upcoming/list', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingInterviews = await ScheduledInterview.find({
      date: { $gte: today },
      status: 'scheduled'
    })
    .sort({ date: 1, time: 1 })
    .lean();
    
    res.status(200).json({
      success: true,
      count: upcomingInterviews.length,
      interviews: upcomingInterviews
    });
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming interviews',
      error: error.message
    });
  }
});

// GET past interviews
router.get('/past/list', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pastInterviews = await ScheduledInterview.find({
      date: { $lt: today }
    })
    .sort({ date: -1, time: -1 })
    .lean();
    
    res.status(200).json({
      success: true,
      count: pastInterviews.length,
      interviews: pastInterviews
    });
  } catch (error) {
    console.error('Error fetching past interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch past interviews',
      error: error.message
    });
  }
});

// PATCH update interview status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: scheduled, completed, or cancelled'
      });
    }
    
    const interview = await ScheduledInterview.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Interview status updated successfully',
      interview
    });
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview status',
      error: error.message
    });
  }
});

// POST regenerate Google Meet link
router.post('/:id/generate-meet-link', async (req, res) => {
  try {
    const interview = await ScheduledInterview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }
    
    const meetingLink = generateGoogleMeetLink(
      interview.title,
      interview.candidateName,
      interview.candidateEmail,
      interview.date,
      interview.time,
      interview.duration
    );
    
    interview.meetingLink = meetingLink;
    interview.updatedAt = Date.now();
    await interview.save();
    
    res.status(200).json({
      success: true,
      message: 'Google Meet link generated successfully',
      meetingLink,
      interview
    });
  } catch (error) {
    console.error('Error generating meet link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meet link',
      error: error.message
    });
  }
});

module.exports = router;