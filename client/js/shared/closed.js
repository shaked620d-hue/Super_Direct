const reopenTime = document.getElementById('reopenTime');
const reopenValue = new URLSearchParams(window.location.search).get('reopensAt');

// מציגים את מועד הפתיחה שהשרת העביר בפורמט קריא בעברית.
if (reopenValue) {
    const reopenDate = new Date(reopenValue);
    if (!Number.isNaN(reopenDate.getTime())) {
        reopenTime.dateTime = reopenDate.toISOString();
        reopenTime.textContent = new Intl.DateTimeFormat('he-IL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(reopenDate);
    }
}
