import {AppDataSource} from "../data-source"
import {NextFunction, Request, Response} from "express"
import {User} from "../entity/User"
import {Controller} from "../decorator/Controller";
import {Route} from "../decorator/Route"
import {Repository} from "typeorm";
import * as bcrypt from "bcrypt";   // Used for hashing the password

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: UserController.ts
 * http://localhost:3004/users
 */

@Controller('/users')
export class UserController {
    // Connect to DB
    userRepo: Repository<User> = AppDataSource.getRepository(User)

    /**
     * GET the user token using username and password
     * @param req
     * @param res
     * @param next
     */
    @Route('post')
    async read(req: Request, res: Response, next: NextFunction) {
        const user = req.user; // Extract user from request object
        // Only users with read and write access level can request GET
        if (user.accessLevel !== "read" && user.accessLevel !== "write") {
            return res.status(403).json({ message: "Forbidden: Insufficient access level" });
        }

        const { username, password } = req.body; // Extract username and password from request body

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Search for the user in the database
        const matchedUser: User = await this.userRepo.findOne({
            where: { username: username }
        });

        if (!matchedUser) {
            return res.status(404).json({ message: "Invalid username or password" });
        }

        // Compare the raw password with the hashed password
        const isPasswordMatch = await bcrypt.compare(password, matchedUser.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Return the token stored in the user record
        return res.status(200).json({ token: matchedUser.token });
    }
}