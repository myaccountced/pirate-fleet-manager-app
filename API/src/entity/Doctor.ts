import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";
import {IsIn, IsNotEmpty, IsOptional, IsPositive, Length, Matches, Max, Min} from "class-validator";

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Doctor.ts
 * Doctor entity
 */

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn("uuid")
    @IsOptional()
    id: string;

    @Column({type: "varchar", length: 30, nullable: false})
    @Matches(/^[A-Z][\s\S]{0,29}$/, { message: 'Pirate name must start with a capital letter' })
    @Length(1, 30, {message: 'Pirate name must be 1 to 30 characters'})
    @IsNotEmpty({message: 'Pirate name is required'})
    name: string;

    @Column({type: "integer", width: 2, nullable: false})
    @Max(70, {message: 'Age must be 70 or less, please retire'})
    @Min(20, {message: 'Age must be 20 or greater, you are too young boy!'})
    @IsPositive({message: 'Age should be positive'})
    @IsNotEmpty({message: 'Age is required'})
    age: number;

    @Column({type: "varchar", length: 20, nullable: false})
    @Length(1, 20, {message: 'Speciality must be 1 to 20 characters'})
    @IsNotEmpty({message: 'Speciality is required'})
    speciality: string;

    @Column({type: "integer", width: 2, nullable: false})
    @Max(50, {message: 'Years of experience must be 50 or less, please retire'})
    @Min(2, {message: 'Years of experience must be 2 years or greater'})
    @IsPositive({message: 'Years of experience should be positive'})
    @IsNotEmpty({message: 'Years of experience is required'})
    yearsOfExp: number;

    @Column({type: "varchar", length: 20, nullable: false})
    @Length(1, 20, {message: 'Favourite remedy must be 1 to 20 characters'})
    @IsNotEmpty({message: 'Favourite remedy is required'})
    favRemedy: string;

    @Column({type: "varchar", length: 20, nullable: false})
    @Matches(/^[A-Z].{1,20}/, {message: 'Ship must start with a capital letter'})
    @IsIn(["Black Pearl", "Thousand Sunny", "Going Merry"],
        { message: 'Ship must be either Black Pearl, Thousand Sunny, or Going Merry (upper cases and lower cases matter)' })
    @IsNotEmpty({message: 'Ship name is required'})
    ship: string;
}