import {RouteDefinition} from './RouteDefinition'

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Route.ts
 */

export const Route = (method = 'get', param = ''): MethodDecorator => {
    return (target, propertyKey: string): void => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', [], target.constructor)
        }
        // Get the routes stored so far, extend it by the new route and re-set the metadata.
        const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>
        routes.push({
            method,
            param,
            action: propertyKey,
        })
        Reflect.defineMetadata('routes', routes, target.constructor)
    }
}