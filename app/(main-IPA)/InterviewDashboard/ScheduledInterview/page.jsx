"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Plus, ArrowLeft, Video, Users, Trash2, ExternalLink, RefreshCw, Edit, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ScheduledInterviewPage() {
  const router = useRouter();
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    title: "",
    candidateName: "",
    candidateEmail: "",
    date: "",
    time: "",
    duration: "60",
    meetingLink: "",
    notes: "",
  });

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  const fetchScheduledInterviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/scheduled-interview');
      const data = await res.json();
      if (data.success) {
        setScheduledInterviews(data.interviews || []);
      } else {
        showToast("Failed to load interviews", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/scheduled-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        showToast("Interview scheduled successfully! 🎉", "success");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchScheduledInterviews();
      } else {
        showToast(data.message || "Failed to schedule interview", "error");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      showToast("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/scheduled-interview/${selectedInterview._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        showToast("Interview updated successfully! ✅", "success");
        setIsUpdateDialogOpen(false);
        setSelectedInterview(null);
        resetForm();
        fetchScheduledInterviews();
      } else {
        showToast(data.message || "Failed to update interview", "error");
      }
    } catch (error) {
      console.error("Error updating interview:", error);
      showToast("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/scheduled-interview/${selectedInterview._id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        showToast("Interview deleted successfully! 🗑️", "success");
        setIsDeleteDialogOpen(false);
        setSelectedInterview(null);
        fetchScheduledInterviews();
      } else {
        showToast(data.message || "Failed to delete interview", "error");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateDialog = (interview) => {
    setSelectedInterview(interview);
    const formattedDate = new Date(interview.date).toISOString().split('T')[0];
    setFormData({
      title: interview.title,
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      date: formattedDate,
      time: interview.time,
      duration: interview.duration.toString(),
      meetingLink: interview.meetingLink || "",
      notes: interview.notes || "",
    });
    setIsUpdateDialogOpen(true);
  };

  const openDeleteDialog = (interview) => {
    setSelectedInterview(interview);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      candidateName: "",
      candidateEmail: "",
      date: "",
      time: "",
      duration: "60",
      meetingLink: "",
      notes: "",
    });
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (date, time) => {
    const interviewDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    interviewDateTime.setHours(parseInt(hours), parseInt(minutes));
    return interviewDateTime > new Date();
  };

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-6xl mx-auto">
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5">
            <Alert 
              className={`min-w-[350px] shadow-lg border-2 ${
                toast.type === "success" 
                  ? "bg-green-500/10 border-green-500/50 text-green-400" 
                  : "bg-red-500/10 border-red-500/50 text-red-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <AlertDescription className="font-medium">{toast.message}</AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <ArrowLeft 
              onClick={() => router.back()} 
              className='cursor-pointer text-gray-300 hover:text-white transition-colors' 
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Scheduled Interviews</h1>
              <p className="text-gray-400 mt-1">Manage your interview schedule</p>
            </div>
          </div>

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Schedule New Interview</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details to schedule an interview. A Google Meet link will be generated automatically.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Interview Title *</label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Senior Full Stack Developer Interview"
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Candidate Name *</label>
                    <Input 
                      value={formData.candidateName}
                      onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                      placeholder="John Doe"
                      className="bg-slate-900/50 border-slate-600 text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Candidate Email *</label>
                    <Input 
                      type="email"
                      value={formData.candidateEmail}
                      onChange={(e) => setFormData({...formData, candidateEmail: e.target.value})}
                      placeholder="john@example.com"
                      className="bg-slate-900/50 border-slate-600 text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Date *</label>
                    <Input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="bg-slate-900/50 border-slate-600 text-gray-100"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Time *</label>
                    <Input 
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="bg-slate-900/50 border-slate-600 text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Duration (min) *</label>
                    <Input 
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="60"
                      min="15"
                      max="480"
                      className="bg-slate-900/50 border-slate-600 text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Meeting Link (Optional)
                    <span className="text-gray-500 text-xs ml-2">Leave empty to auto-generate Google Meet link</span>
                  </label>
                  <Input 
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                    placeholder="https://meet.google.com/abc-defg-hij or Zoom link"
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Notes (Optional)</label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes about the interview..."
                    className="bg-slate-900/50 border-slate-600 text-gray-100 min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    className="bg-slate-700 hover:bg-slate-600 border-slate-600"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Interview
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Update Dialog - Same as Create but with existing data */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Update Interview</DialogTitle>
              <DialogDescription className="text-gray-400">
                Modify the interview details below
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Interview Title *</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Senior Full Stack Developer Interview"
                  className="bg-slate-900/50 border-slate-600 text-gray-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Candidate Name *</label>
                  <Input 
                    value={formData.candidateName}
                    onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                    placeholder="John Doe"
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Candidate Email *</label>
                  <Input 
                    type="email"
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData({...formData, candidateEmail: e.target.value})}
                    placeholder="john@example.com"
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Date *</label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Time *</label>
                  <Input 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Duration (min) *</label>
                  <Input 
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="60"
                    min="15"
                    max="480"
                    className="bg-slate-900/50 border-slate-600 text-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Meeting Link</label>
                <Input 
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                  placeholder="https://meet.google.com/..."
                  className="bg-slate-900/50 border-slate-600 text-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Notes</label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about the interview..."
                  className="bg-slate-900/50 border-slate-600 text-gray-100 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsUpdateDialogOpen(false);
                    setSelectedInterview(null);
                    resetForm();
                  }}
                  className="bg-slate-700 hover:bg-slate-600 border-slate-600"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Interview
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-100">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the scheduled interview
                {selectedInterview && (
                  <span className="block mt-2 text-purple-400 font-semibold">
                    "{selectedInterview.title}"
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
                disabled={loading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Loading State */}
        {loading && scheduledInterviews.length === 0 ? (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
            <RefreshCw className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading interviews...</p>
          </div>
        ) : scheduledInterviews.length === 0 ? (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Scheduled Interviews</h2>
            <p className="text-gray-400 mb-6">Schedule your first interview to get started</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {scheduledInterviews.map((interview) => {
              const upcoming = isUpcoming(interview.date, interview.time);
              
              return (
                <div 
                  key={interview._id}
                  className={`bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border transition-all ${
                    upcoming 
                      ? 'border-purple-500/30 hover:border-purple-500/50' 
                      : 'border-slate-700/50 hover:border-slate-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-200">{interview.title}</h3>
                        {upcoming && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full">
                            Upcoming
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <div>
                            <div className="text-gray-300">{interview.candidateName}</div>
                            <div className="text-sm text-gray-500">{interview.candidateEmail}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-gray-300">{formatDate(interview.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-gray-300">
                            {formatTime(interview.time)} ({interview.duration} min)
                          </span>
                        </div>
                      </div>

                      {interview.meetingLink && (
                        <div className="mb-3">
                          <Button
                            onClick={() => handleJoinMeeting(interview.meetingLink)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Google Meet
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                          <div className="mt-2 text-xs text-gray-500 font-mono bg-slate-900/50 px-3 py-2 rounded-lg">
                            {interview.meetingLink}
                          </div>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="bg-slate-900/50 rounded-lg p-3 mt-3">
                          <p className="text-gray-400 text-sm">
                            <span className="text-gray-500 font-semibold">Notes: </span>
                            {interview.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUpdateDialog(interview)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        title="Update Interview"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(interview)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Delete Interview"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}