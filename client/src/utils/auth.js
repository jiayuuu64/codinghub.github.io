// Check if user is authenticated
export const isAuthenticated = () => !!localStorage.getItem('token');

// Logout function to clear only authentication data
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
};
