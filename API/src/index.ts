import * as express from "express"
import * as bodyParser from "body-parser"
import {NextFunction, Request, Response} from "express"
import {AppDataSource} from "./data-source"
import {RouteDefinition} from "./decorator/RouteDefinition"
import * as createError from "http-errors"
import * as cors from "cors"
import {FighterController} from "./controller/FighterController"
import {DoctorController} from "./controller/DoctorController"
import {ShipwrightController} from "./controller/ShipwrightController"
import {UserController} from "./controller/UserController"
import {DeceasedController} from "./controller/DeceasedController"
import {authToken} from "./middleware/Authenticate"
import {User} from "./entity/User"

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: index.ts
 */

// Setup cors options
const corsOptions = {
    credentials: true,
    origin: /localhost:\d{4,5}$/i,
    allowHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    methods: "GET,POST,PUT,DELETE,OPTIONS"
}

AppDataSource.initialize().then(async () => {
    const app = express() // Create express app
    app.use(bodyParser.json())
    app.use(cors(corsOptions))
    app.use((req: Request, res: Response, next: NextFunction) => {
        next()
    })
    app.use(authToken) // Apply authentication
    app.options('*', cors(corsOptions))

    // Iterate over all controllers and register routes
    const controllers = [
        DeceasedController,
        FighterController,
        DoctorController,
        ShipwrightController,
        UserController,
    ]
    controllers.forEach((controller) => {
        const instance = new controller();
        const path = Reflect.getMetadata('path', controller);
        // Routes array
        const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller);
        // Iterate over all routes and register them to express application
        routes.forEach((route) => {
            app[route.method](path + route.param, (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const result = instance[route.action](req, res, next);
                if (result instanceof Promise) {
                    result.then((result) => result !== null && result !== undefined ? res.send(result) :
                        next())
                        .catch((err) => next(createError(500, err)));
                } else if (result !== null && result !== undefined) res.json(result);
            })
        })
    })

    // Umbrella catch
    app.use(function (req, res, next) {
        next(createError(404))
    })

    app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.json({error: err.message, status: err.status, stack: err.stack.split(/\s{4,}/)})
    })

    // Start express server
    const port = process.env.PORT || 3004
    app.listen(port)

    // Insert new users
    await AppDataSource.manager.save(
        AppDataSource.manager.create(User, {
            username: "userwrite",
            password: "$2b$10$sYjW5psdx3pS8olV76F5/uTXxBktcHQkHuN6zamciFTit97A20XZW",
            token: "iHaveWriteAccessLevel",
            accessLevel: "write"
        })
    )
    await AppDataSource.manager.save(
        AppDataSource.manager.create(User, {
            username: "userread",
            password: "$2b$10$c/8RX5Kuhrb1abFAmZJE1.rIFqdl7mmMMD4wPkH6hua3zLS2ahlLS",
            token: "iHaveReadAccessLevel",
            accessLevel: "read"
        })
    )

    console.log(`Open http://localhost:${port}/fighters to see results`)
    console.log(`Open http://localhost:${port}/doctors to see results`)
    console.log(`Open http://localhost:${port}/shipwrights to see results`)
    console.log(`Open http://localhost:${port}/users to see results`)
    console.log(`Open http://localhost:${port}/deceased to see results`)

}).catch(error => console.log(error))
