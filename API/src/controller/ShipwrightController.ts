import {AppDataSource} from "../data-source"
import {NextFunction, Request, Response} from "express"
import {validate, ValidationError, ValidatorOptions} from "class-validator"
import {Controller} from "../decorator/Controller"
import {Route} from "../decorator/Route"
import {Like, Repository} from "typeorm"
import {Shipwright} from "../entity/Shipwright"

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: ShipwrightController.ts
 * http://localhost:3004/shipwrights
 */

@Controller('/shipwrights')
export class ShipwrightController {
    // Connect to DB
    shipwrightRepo: Repository<Shipwright> = AppDataSource.getRepository(Shipwright)

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
     * GET the shipwrights of your fleet
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
            return this.shipwrightRepo.findOneBy({id: req.params.uuid})
        } else {
            // Setup options for searching and sorting
            const findOptions = {where:[],order:{}}
            const existingColumns = this.shipwrightRepo.metadata.ownColumns.map(c=> c.propertyName)

            const sortByField = existingColumns.includes(req.query.sortBy) ? req.query.sortBy : "id"
            const sortDirection = req.query.backwards? "DESC" : "ASC"
            findOptions.order[sortByField] = sortDirection

            // Only return members of the specified ship
            if (req.query.ship) {
                for (const shipColumn of existingColumns) {
                    findOptions.where.push({[shipColumn]: Like(`%${req.query.ship}%`)})
                }
            }

            return this.shipwrightRepo.find(findOptions)
        }
    }

    /**
     * DELETE a shipwright
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

        const exists: boolean = await this.shipwrightRepo.exists({
            where: {
                id: req.params.uuid
            }
        })
        if (exists) {
            await this.shipwrightRepo.delete(req.params.uuid)
            return res.status(200).json({ message: "Successfully deleted the shipwright" });
        } else {
            next() // Shipwright does not exist - umbrella in index catches the 404 error
        }
    }

    /**
     * POST or create a shipwright
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

        const shipwrightToInsert = Object.assign(new Shipwright(), req.body)

        const violations: ValidationError[] = await validate(shipwrightToInsert, this.validOptions)

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
            return this.shipwrightRepo.insert(shipwrightToInsert)
        }
    }

    /**
     * PUT or update information of a shipwright
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

        // Ensure shipwright exists
        const shipwrightToUpdate = await this.shipwrightRepo.findOneBy({id: req.params.uuid})
        Object.assign(shipwrightToUpdate, req.body)

        // Update the shipwright
        if (!shipwrightToUpdate) {
            next() // Caught by the umbrella code
        } else {
            // Validate
            const violations:ValidationError[] = await validate(shipwrightToUpdate, this.validOptions)
            if (violations.length) {
                res.statusCode = 422 // Unprocessable Content

                // Map violations to a cleaner structure
                const formattedErrors = violations.map(violation => ({
                    property: violation.property,
                    message: Object.values(violation.constraints), // Extract only the constraint messages
                }));

                return formattedErrors
            } else {
                return this.shipwrightRepo.update(req.params.uuid, shipwrightToUpdate)
            }
        }
    }
}
