/**
 * Resource ownership verification middleware
 * @param {Object} model - Sequelize model
 * @param {string} paramName - Name of the parameter containing resource ID
 * @param {string} userField - Name of the field containing user ID
 * @returns {Function} Express middleware function
 */
const verifyOwnership = (model, paramName = 'id', userField = 'userId') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];
            const resource = await model.findByPk(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found.'
                });
            }

            if (resource[userField] !== req.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource.'
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error('Error in verifyOwnership middleware:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    };
};

module.exports = verifyOwnership;
