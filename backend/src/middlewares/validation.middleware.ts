import { Request, Response, NextFunction } from "express";
import { z, ZodError } from 'zod';

export function validateData(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = (error as ZodError).issues.map((issue) => ({
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