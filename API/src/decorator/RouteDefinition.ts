/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: RouteDefinition.ts
 */
export interface RouteDefinition {
    param: string
    method: string // HTTP method. ex: get, post, delete, put, patch, options
    action: string // method/function in the controller object. ex: all, one, save, remove
}