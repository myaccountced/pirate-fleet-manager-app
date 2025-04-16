/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Controller.ts
 */
export const Controller = (path = ''): ClassDecorator => {
    return (target: any) => {
        Reflect.defineMetadata('path', path, target)
        if (!Reflect.hasMetadata('routes', target)) {
            Reflect.defineMetadata('routes', [], target)
        }
    }
}