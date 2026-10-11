import { getMessagesRequest, updateMessageStatusRequest, replyToMessageRequest } from './messageService.js';
import { guardAdminOnly } from '../shared/storage.js';
import { API_BASE_URL } from '../shared/config.js';
import { showToast } from '../cart/cart.js';

/**
 * כרטיס הודעה מוצג כ-details/summary כדי שיהיה סגור כברירת מחדל וייפתח בלחיצה, כמו בהזמנות.
 * @param {object} message - אובייקט ההודעה להצגה.
 * @returns {HTMLElement} אלמנט ה-details של כרטיס ההודעה.
 */
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
    // ברגע שהודעה מסומנת כטופלה זה חד-כיווני - הקובץ המצורף כבר נמחק בשרת, אז אין טעם לאפשר לבטל את הסימון.
    handledCheckbox.disabled = message.handled;
    handledCheckbox.dataset.messageId = message._id;
    handledCheckbox.addEventListener('change', handleStatusChange);
    handledLabel.append(handledCheckbox, 'טופלה');

    const handledRow = document.createElement('div');
    handledRow.className = 'message-handled-row';
    handledRow.append(handledLabel);

    const children = [summary, subject, email, body];
    let replyBox;

    // תיבת התגובה מוצגת ישירות (בלי כפתור "מענה" נפרד) - מיותר להודעה שכבר טופלה.
    if (!message.handled) {
        replyBox = document.createElement('div');
        replyBox.className = 'message-reply-box';

        const replyTextarea = document.createElement('textarea');
        replyTextarea.placeholder = 'כתבי כאן את התגובה ללקוח...';

        const sendButton = document.createElement('button');
        sendButton.type = 'button';
        sendButton.className = 'admin-btn edit';
        sendButton.textContent = 'שליחה';

        sendButton.addEventListener('click', async () => {
            const replyText = replyTextarea.value.trim();
            if (!replyText) {
                showToast('יש לכתוב תגובה לפני השליחה');
                return;
            }
            try {
                const response = await replyToMessageRequest(message._id, replyText);
                if (!response.ok) {
                    showToast('שליחת התגובה נכשלה');
                    return;
                }
                showToast('התגובה נשלחה בהצלחה ללקוח, וההודעה סומנה כטופלה');
                loadMessages();
            } catch {
                showToast('אירעה שגיאה בשליחת התגובה');
            }
        });

        replyBox.append(replyTextarea, sendButton);
    }

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
    if (replyBox) children.push(replyBox);
    card.append(...children);
    return card;
};

/**
 * מטפלת בשינוי תיבת הסימון "טופלה" של הודעה - מעדכנת את הסטטוס בשרת.
 * @param {Event} event - אירוע השינוי של תיבת הסימון.
 */
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

/**
 * טוענת את כל ההודעות מהשרת ומציגה אותן מקובצות לפי מצב הטיפול (טופלו / לא טופלו).
 */
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
