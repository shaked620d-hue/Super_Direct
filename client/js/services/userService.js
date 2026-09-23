const updateUserRequest = async (id, details) => {
 return fetch(`${API_BASE_URL}/api/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, //application= קטגוריה  ,  json= פורמט_ספציפי
        body: JSON.stringify(details)
    });
}