import "reflect-metadata"
import {DataSource} from "typeorm"
import {User} from "./entity/User"
import {Doctor} from "./entity/Doctor";
import {Fighter} from "./entity/Fighter";
import {Shipwright} from "./entity/Shipwright"
import {Deceased} from "./entity/Deceased"

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: data-source.ts
 */

export const AppDataSource = new DataSource({
    type:'sqlite',
    database:'./sqlite.db',
    synchronize: true,
    logging: false,
    entities: [User, Doctor, Fighter, Shipwright, Deceased], // Entities used in this API
    migrations: [],
    subscribers: [],
})
