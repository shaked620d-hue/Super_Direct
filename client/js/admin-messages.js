const guardAdminOnly = () => {
    if (!isAdmin()) {
        window.location.href = '../index.html';
    }
};

// כרטיס הודעה מוצג כ-details/summary כדי שיהיה סגור כברירת מחדל וייפתח בלחיצה, כמו בהזמנות.
const createMessageCard = (message) => {
    const card = document.createElement('details');
    card.className = 'order-card';

    const summary = document.createElement('summary');
    summary.className = 'order-card-header';
    const messageDate = new Date(message.createdAt);
    const date = document.createElement('span');
    date.textContent = messageDate.toLocaleDateString('he-IL');
    const from = document.createElement('span');
    from.textContent = message.name;
    const time = document.createElement('span');
    time.textContent = messageDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    summary.append(date, from, time);

    const subject = document.createElement('p');
    subject.className = 'order-customer';
    subject.textContent = `נושא: ${message.subject}`;

    const email = document.createElement('p');
    email.className = 'order-customer';
    email.textContent = `אימייל: ${message.email}`;

    const body = document.createElement('p');
    body.className = 'message-body';
    body.textContent = `תוכן ההודעה: ${message.message}`;

    const handledLabel = document.createElement('label');
    handledLabel.className = 'message-handled-label';
    const handledCheckbox = document.createElement('input');
    handledCheckbox.type = 'checkbox';
    handledCheckbox.checked = message.handled;
    handledCheckbox.dataset.messageId = message._id;
    handledCheckbox.addEventListener('change', handleStatusChange);
    handledLabel.append(handledCheckbox, 'טופלה');

    // פותח את תוכנת המייל של מי שלוחץ (לא תלוי בשרת), עם כתובת הלקוח כבר ממולאת.
    const replyLink = document.createElement('a');
    replyLink.className = 'admin-btn edit';
    replyLink.href = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
    replyLink.textContent = 'מענה';

    const handledRow = document.createElement('div');
    handledRow.className = 'message-handled-row';
    handledRow.append(handledLabel, replyLink);

    const children = [summary, subject, email, body];

    if (message.attachment) {
        const attachmentLink = document.createElement('a');
        attachmentLink.href = `${API_BASE_URL}/public/${message.attachment}`;
        attachmentLink.target = '_blank';
        const attachmentImage = document.createElement('img');
        attachmentImage.src = `${API_BASE_URL}/public/${message.attachment}`;
        attachmentImage.alt = 'קובץ מצורף להודעה';
        attachmentImage.className = 'attachment-preview';
        attachmentLink.append(attachmentImage);
        children.push(attachmentLink);
    }

    children.push(handledRow);
    card.append(...children);
    return card;
};

const handleStatusChange = async (event) => {
    const checkbox = event.target;
    const messageId = checkbox.dataset.messageId;
    try {
        const response = await updateMessageStatusRequest(messageId, checkbox.checked);
        if (!response.ok) {
            showToast('עדכון הסטטוס נכשל');
            return;
        }
        showToast('הסטטוס עודכן');
    } catch {
        showToast('אירעה שגיאה בעדכון הסטטוס');
    }
};

const HANDLED_ORDER = [false, true];
const HANDLED_LABEL = { false: 'לא טופלו', true: 'טופלו' };

const loadMessages = async () => {
    try {
        const response = await getMessagesRequest();
        const messages = await response.json();

        if (messages.length === 0) {
            document.getElementById('noMessages').hidden = false;
            return;
        }

        const groups = [];
        HANDLED_ORDER.forEach((handled) => {
            const messagesInGroup = messages
                .filter((message) => message.handled === handled)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            if (messagesInGroup.length === 0) return;

            const group = document.createElement('details');
            group.className = 'order-status-group';

            const heading = document.createElement('summary');
            heading.className = 'order-status-heading';
            heading.textContent = `${HANDLED_LABEL[handled]} (${messagesInGroup.length})`;

            group.append(heading, ...messagesInGroup.map(createMessageCard));
            groups.push(group);
        });

        document.getElementById('messagesList').replaceChildren(...groups);
    } catch {
        showToast('שגיאה בטעינת ההודעות');
    }
};

document.addEventListener('DOMContentLoaded', loadMessages);
document.addEventListener('DOMContentLoaded', guardAdminOnly);
