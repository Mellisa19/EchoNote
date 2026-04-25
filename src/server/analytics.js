function generateMonthlyTrends(meetings) {
    const trends = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthMeetings = meetings.filter(m => {
            const meetingDate = new Date(m.date || m.createdAt);
            return meetingDate.getMonth() === monthDate.getMonth() && 
                   meetingDate.getFullYear() === monthDate.getFullYear();
        });
        
        trends.push({
            month: monthName,
            meetings: monthMeetings.length,
            duration: monthMeetings.reduce((sum, m) => sum + (m.duration || 0), 0),
            actionItems: monthMeetings.reduce((sum, m) => sum + (m.actionItems ? m.actionItems.length : 0), 0)
        });
    }
    
    return trends;
}

function generateSpeakerStats(meetings) {
    const speakerStats = {};
    
    meetings.forEach(meeting => {
        if (meeting.transcript && meeting.transcript.speakers) {
            meeting.transcript.speakers.forEach(speaker => {
                if (!speakerStats[speaker.name]) {
                    speakerStats[speaker.name] = { totalDuration: 0, meetingsCount: 0, segmentsCount: 0 };
                }
                speakerStats[speaker.name].totalDuration += speaker.totalDuration || 0;
                speakerStats[speaker.name].meetingsCount += 1;
                speakerStats[speaker.name].segmentsCount += speaker.segmentsCount || 0;
            });
        }
    });
    
    return Object.entries(speakerStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalDuration - a.totalDuration);
}

function calculateProductivityScore(meeting) {
    let score = 50;
    if (meeting.actionItems && meeting.actionItems.length > 0) score += Math.min(meeting.actionItems.length * 10, 30);
    if (meeting.summary && meeting.summary.length > 100) score += 10;
    if (meeting.duration && meeting.duration < 60) score += 10;
    return Math.min(score, 100);
}

module.exports = {
    generateMonthlyTrends,
    generateSpeakerStats,
    calculateProductivityScore
};
