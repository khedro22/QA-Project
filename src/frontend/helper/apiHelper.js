const ApiHelper = {
    
    getToken() {
        return localStorage.getItem('token');
    },

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        };
    }

}
