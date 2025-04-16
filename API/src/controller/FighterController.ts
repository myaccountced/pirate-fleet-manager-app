import {AppDataSource} from "../data-source"
import {NextFunction, Request, Response} from "express"
import {Fighter} from "../entity/Fighter"
import {validate, ValidationError, ValidatorOptions} from "class-validator";
import {Controller} from "../decorator/Controller";
import {Route} from "../decorator/Route"
import {Like, Repository} from "typeorm";

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: FighterController.ts
 * http://localhost:3004/fighters
 */

@Controller('/fighters')
export class FighterController {
    // Connect to DB
    fighterRepo: Repository<Fighter> = AppDataSource.getRepository(Fighter)

    validOptions: ValidatorOptions = {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        validationError: {
            target: false,
            value: false
        },
        stopAtFirstError: true
    }

    /**
     * GET the fighters of your fleet
     * @param req
     * @param res
     * @param next
     */
    @Route('get', '/:uuid*?')
    async read(req: Request, res: Response, next: NextFunction) {
        const user = req.user; // Extract user from request object
        // Only users with read and write access level can request GET
        if (user.accessLevel !== "read" && user.accessLevel !== "write") {
            return res.status(403).json({ message: "Forbidden: Insufficient access level" });
        }

        if (req.params.uuid) {
            return this.fighterRepo.findOneBy({id: req.params.uuid})
        } else {
            // Setup options for searching and sorting
            const findOptions = {where:[],order:{}}
            const existingColumns = this.fighterRepo.metadata.ownColumns.map(c=> c.propertyName)

            const sortByField = existingColumns.includes(req.query.sortBy) ? req.query.sortBy : "id"
            const sortDirection = req.query.backwards? "DESC" : "ASC"
            findOptions.order[sortByField] = sortDirection

            // Only return members of the specified ship
            if (req.query.ship) {
                for (const shipColumn of existingColumns) {
                    findOptions.where.push({[shipColumn]: Like(`%${req.query.ship}%`)})
                }
            }

            return this.fighterRepo.find(findOptions)
        }
    }

    /**
     * DELETE a fighter
     * @param req
     * @param res
     * @param next
     */
    @Route('delete', '/:uuid')
    async delete(req: Request, res: Response, next: NextFunction) {
        const user = req.user; // Extract user from request object
        // Only users with write access level can request DELETE
        if (user.accessLevel !== "write") {
            return res.status(403).json({ message: "Forbidden: Insufficient access level" });
        }

        const exists: boolean = await this.fighterRepo.exists({
            where: {
                id: req.params.uuid
            }
        })
        if (exists) {
            await this.fighterRepo.delete(req.params.uuid)
            return res.status(200).json({ message: "Successfully deleted the fighter" });
        } else {
            next() // Fighter does not exist - umbrella in index catches the 404 error
        }
    }

    /**
     * POST or create a fighter
     * @param req
     * @param res
     * @param next
     */
    @Route('post')
    async create(req: Request, res: Response, next: NextFunction) {
        const user = req.user; // Extract user from request object
        // Only users with write access level can request POST
        if (user.accessLevel !== "write") {
            return res.status(403).json({ message: "Forbidden: Insufficient access level" });
        }

        const fighterToInsert = Object.assign(new Fighter(), req.body)

        const violations: ValidationError[] = await validate(fighterToInsert, this.validOptions)

        // If there are errors to the rules
        if (violations.length) {
            res.statusCode = 422; // Unprocessable Content (WebDAV)

            // Map violations to a cleaner structure
            const formattedErrors = violations.map(violation => ({
                property: violation.property,
                message: Object.values(violation.constraints), // Extract only the constraint messages
            }));

            return formattedErrors
        } else {
            res.statusCode = 201; // Created
            return this.fighterRepo.insert(fighterToInsert)
        }
    }

    /**
     * PUT or update information of a fighter
     * @param req
     * @param res
     * @param next
     */
    @Route('put', '/:uuid')
    async update(req: Request, res: Response, next: NextFunction) {
        const user = req.user; // Extract user from request object
        // Only users with write access level can request PUT
        if (user.accessLevel !== "write") {
            return res.status(403).json({ message: "Forbidden: Insufficient access level" });
        }

        // Ensure the uuid param matches the id in the req.body
        if (req.params.uuid != req.body.id) {
            next()
        }

        // Ensure fighter exists
        const fighterToUpdate = await this.fighterRepo.findOneBy({id: req.params.uuid})
        Object.assign(fighterToUpdate, req.body)

        // Update the fighter
        if (!fighterToUpdate) {
            next() // Caught by the umbrella code
        } else {
            // Validate
            const violations:ValidationError[] = await validate(fighterToUpdate, this.validOptions)
            if (violations.length) {
                res.statusCode = 422 // Unprocessable Content

                // Map violations to a cleaner structure
                const formattedErrors = violations.map(violation => ({
                    property: violation.property,
                    message: Object.values(violation.constraints), // Extract only the constraint messages
                }));

                return formattedErrors
            } else {
                return this.fighterRepo.update(req.params.uuid, fighterToUpdate)
            }
        }
    }
}
