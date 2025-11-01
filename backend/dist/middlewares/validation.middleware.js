import { ZodError } from 'zod';
export function validateData(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }));
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errorMessages,
                });
            }
            // Handle other types of errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
}
