/**
 * Prompt injection protection middleware
 */
const promptGuard = (req, res, next) => {
    const textFields = ['prompt', 'query', 'message', 'text', 'description', 'content'];
    
    const disallowedPatterns = [
        'ignore previous instructions', 'ignore above', 'disregard', 
        'you are now', 'act as', 'pretend to be', 'system:', 'SYSTEM:', 
        '### instruction', '\\[INST\\]', '<\\|system\\|>', 'do anything now', 
        'DAN', 'jailbreak'
    ];
    
    // Regex for checking excessive special characters used for delimiter injection
    const delimiterPattern = /(?:```|===|---|\\n\\n\\n|"""|~~~)/g;
    
    const patternRegex = new RegExp(disallowedPatterns.join('|'), 'i');

    for (const field of textFields) {
        if (req.body && req.body[field] && typeof req.body[field] === 'string') {
            let content = req.body[field];

            // Content length limit
            if (content.length > 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Input contains disallowed content.' // Matching requirement format if preferred, though length is specific
                });
            }

            // Injection detection (patterns)
            if (patternRegex.test(content)) {
                return res.status(400).json({
                    success: false,
                    message: 'Input contains disallowed content.'
                });
            }

            // Injection detection (delimiters)
            const matches = content.match(delimiterPattern);
            if (matches && matches.length > 2) { 
                 return res.status(400).json({
                    success: false,
                    message: 'Input contains disallowed content.'
                });
            }

            // Sanitize: strip control characters (except \n \t)
            content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
            req.body[field] = content;
        }
    }
    
    next();
};

module.exports = promptGuard;
