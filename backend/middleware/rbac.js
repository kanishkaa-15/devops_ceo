/**
 * Role-Based Access Control Middleware
 * Ensures the requester has the required role (e.g., 'ceo') before proceeding.
 * Assumes an authentication middleware has already attached `req.user`.
 */
const rbac = (requiredRoles = []) => {
    return (req, res, next) => {
        // If authentication layer fails to attach user, deny access
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: No user session found.' });
        }

        // Check if the user's role is in the array of required roles
        if (!requiredRoles.includes(req.user.role)) {
            // Log the unauthorized attempt
            console.warn(`[RBAC BLOCK] User ${req.user._id} (${req.user.role}) attempted to access ${req.originalUrl}`);
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
        }

        next();
    };
};

module.exports = { rbac };
