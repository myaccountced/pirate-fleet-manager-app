import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import {IsIn, IsNotEmpty, IsOptional, Length,} from "class-validator";

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: User.ts
 * User entity
 */

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @IsOptional()
    id: string

    @Column({ type: "varchar", length: 30, nullable: false })
    @Length(1,30, {message: 'Username must be 1-30 characters'})
    @IsNotEmpty({message: 'Username is required'})
    username: string

    @Column({ type: "varchar", length: 100, nullable: false  })
    @Length(1,100, {message: 'Password must be 1-100 characters'})
    @IsNotEmpty({message: 'Password is required'})
    password: string

    @Column({ type: "varchar", length: 30, nullable: false  })
    @Length(1,30, {message: 'Token must be 1-30 characters'})
    @IsNotEmpty({message: 'Token is required'})
    token: string

    @Column({ type: "varchar", length: 5, nullable: false  })
    @Length(1,30, {message: 'Access level must be 1-30 characters'})
    @IsIn(["write", "read"],
        { message: 'Access level must be either write or read (all lower case)' })
    @IsNotEmpty({message: 'Access level is required'})
    accessLevel: string
}
