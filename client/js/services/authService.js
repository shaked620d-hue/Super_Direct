const loginRequest = async (email, password) => {
    return fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
};

const registerRequest = async (details)=>{

return fetch(`${API_BASE_URL}/api/auth/register`, {

                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details)
            });

}