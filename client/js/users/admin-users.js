let userPendingDeletion = null;

const createUserCard = (user, currentUserId) => {
    const card = document.createElement('article');
    card.className = 'user-card';
    card.dataset.userId = user._id;

    const name = document.createElement('h2');
    name.className = 'user-card-name';
    name.textContent = `${user.firstName} ${user.lastName}`.trim() || 'ללא שם';

    const email = document.createElement('p');
    email.className = 'user-card-email';
    email.textContent = user.email;

    const role = document.createElement('p');
    role.className = 'user-card-role';
    role.textContent = user.role === 'admin' ? 'מנהל' : 'לקוח';
    card.append(name, email, role);

    if (user.role !== 'admin' && user._id !== currentUserId) {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'admin-btn delete';
        deleteButton.textContent = 'מחיקת משתמש';
        deleteButton.addEventListener('click', () => openUserDeleteDialog(user));
        card.append(deleteButton);
    }

    return card;
};

const openUserDeleteDialog = (user) => {
    userPendingDeletion = user;
    document.getElementById('userDeleteIdentity').textContent =
        `${user.firstName} ${user.lastName} · ${user.email}`;
    document.getElementById('userDeleteDialog').showModal();
    document.getElementById('cancelUserDelete').focus();
};

const handleUserDelete = async () => {
    if (!userPendingDeletion) return;

    const confirmButton = document.getElementById('confirmUserDelete');
    confirmButton.disabled = true;
    try {
        const response = await deleteUserRequest(userPendingDeletion._id);
        if (response.status === 401) {
            localStorage.removeItem('superDirectCurrentUser');
            window.location.href = 'login.html';
            return;
        }
        if (response.status === 403) {
            showToast('אין הרשאה למחוק את המשתמש הזה');
            return;
        }
        if (!response.ok) {
            throw new Error(`מחיקת המשתמש נכשלה (${response.status})`);
        }

        const result = await response.json();
        document.querySelector(`[data-user-id="${CSS.escape(userPendingDeletion._id)}"]`)?.remove();
        if (document.getElementById('usersList').children.length === 0) {
            document.getElementById('noUsers').hidden = false;
        }
        document.getElementById('userDeleteDialog').close();
        showToast('המשתמש וההודעות הקשורות אליו נמחקו; ההזמנות נשמרו');
        if (result.attachmentCleanupFailures > 0) {
            showToast(`החשבון נמחק, אך מחיקת ${result.attachmentCleanupFailures} קבצים מצורפים נכשלה`);
        }
        userPendingDeletion = null;
    } catch {
        showToast('אירעה שגיאה במחיקת המשתמש');
    } finally {
        confirmButton.disabled = false;
    }
};

const loadUsers = async () => {
    try {
        const response = await getUsersRequest();
        if (response.status === 401) {
            localStorage.removeItem('superDirectCurrentUser');
            window.location.href = 'login.html';
            return;
        }
        if (response.status === 403) {
            showToast('אין לך הרשאה לנהל משתמשים');
            return;
        }
        if (!response.ok) {
            throw new Error(`טעינת המשתמשים נכשלה (${response.status})`);
        }

        const users = await response.json();
        if (!Array.isArray(users)) {
            throw new Error('תגובת המשתמשים אינה רשימה');
        }

        const currentUser = getCurrentUser();
        document.getElementById('usersList').replaceChildren(
            ...users.map((user) => createUserCard(user, currentUser._id))
        );
        document.getElementById('noUsers').hidden = users.length > 0;
    } catch {
        showToast('שגיאה בטעינת המשתמשים');
    }
};

const initializeAdminUsers = () => {
    if (getCurrentUser()?.role !== 'admin') {
        guardAdminOnly();
        return;
    }

    document.getElementById('cancelUserDelete').addEventListener('click', () => {
        document.getElementById('userDeleteDialog').close();
        userPendingDeletion = null;
    });
    document.getElementById('confirmUserDelete').addEventListener('click', handleUserDelete);
    document.getElementById('userDeleteDialog').addEventListener('close', () => {
        userPendingDeletion = null;
    });
    loadUsers();
};

document.addEventListener('DOMContentLoaded', initializeAdminUsers);
