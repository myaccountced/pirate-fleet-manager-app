import {AppDataSource} from "../data-source"
import {NextFunction, Request, Response} from "express"
import {Deceased} from "../entity/Deceased";
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
 * File name: DeceasedController.ts
 * http://localhost:3004/deceased
 */

@Controller('/deceased')
export class DeceasedController {
    // Connect to DB
    deceasedRepo: Repository<Deceased> = AppDataSource.getRepository(Deceased)

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
     * GET the deceased crew of your fleet
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
            return this.deceasedRepo.findOneBy({id: req.params.uuid})
        } else {
            // Setup options for searching and sorting
            const findOptions = {where:[],order:{}}
            const existingColumns = this.deceasedRepo.metadata.ownColumns.map(c=> c.propertyName)

            const sortByField = existingColumns.includes(req.query.sortBy) ? req.query.sortBy : "id"
            const sortDirection = req.query.backwards? "DESC" : "ASC"
            findOptions.order[sortByField] = sortDirection

            // Only return members of the specified ship
            if (req.query.ship) {
                for (const shipColumn of existingColumns) {
                    findOptions.where.push({[shipColumn]: Like(`%${req.query.ship}%`)})
                }
            }

            return this.deceasedRepo.find(findOptions)
        }
    }

    /**
     * POST or create a deceased crew
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

        const crewToInsert = Object.assign(new Deceased(), req.body)

        const violations: ValidationError[] = await validate(crewToInsert, this.validOptions)

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
            return this.deceasedRepo.insert(crewToInsert)
        }
    }
}
