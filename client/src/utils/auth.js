// Check if user is authenticated
export const isAuthenticated = () => !!localStorage.getItem('token');

// Check if user is an admin
export const isAdmin = () => localStorage.getItem('isAdmin') === 'true';

// Logout function to clear all user data
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin'); // ✅ Clear admin flag too
};
