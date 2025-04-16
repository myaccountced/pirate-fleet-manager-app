import {Request, Response, NextFunction} from "express"
import {AppDataSource} from "../data-source"
import {User} from "../entity/User"

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Authenticate.ts
 * Provide authentication for the API server
 */

export async function authToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    // Ensure Bearer token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" })
    }

    const token = authHeader.split(" ")[1];

    // Fetch the user from db using the token
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ token })

    if (!user) {
        return res.status(403).json({ message: "Forbidden: Invalid token" })
    }

    // Attach user to request object for further use
    req.user = user

    next()
}
