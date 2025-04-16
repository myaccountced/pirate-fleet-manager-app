import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";
import {IsIn, IsNotEmpty, IsOptional, IsPositive, Length, Matches, Max, Min} from "class-validator";

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Shipwright.ts
 * Shipwright entity
 */

@Entity()
export class Shipwright {
    @PrimaryGeneratedColumn("uuid")
    @IsOptional()
    id: string;

    @Column({type: "varchar", length: 30, nullable: false})
    @Matches(/^[A-Z][\s\S]{0,29}$/, { message: 'Pirate name must start with a capital letter' })
    @Length(1, 30, {message: 'Pirate name must be 1 to 30 characters'})
    @IsNotEmpty({message: 'Pirate name is required'})
    name: string;

    @Column({type: "integer", width: 5, nullable: false})
    @Max(25000, {message: 'Total hours worked for repair and maintenance must be 25,000 hours or less'})
    @Min(1, {message: 'Total hours worked for repair and maintenance must be 1 hour or greater'})
    @IsPositive({message: 'Total hours worked for repair and maintenance should be positive'})
    @IsNotEmpty({message: 'Total hours worked for repair and maintenance is required'})
    totalHoursWorked: number;

    @Column({type: "integer", width: 2, nullable: false})
    @Max(50, {message: 'Years of experience must be 50 or less, we do not need an old man for a physically demanding job'})
    @Min(1, {message: 'Years of experience must be 1 year or greater'})
    @IsPositive({message: 'Years of experience should be positive'})
    @IsNotEmpty({message: 'Years of experience is required'})
    yearsOfExp: number;

    @Column({type: "varchar", length: 20, nullable: false})
    @Length(1, 20, {message: 'Favourite tool must be 1 to 20 characters'})
    @IsNotEmpty({message: 'Favourite tool is required'})
    favTool: string;

    @Column({type: "varchar", length: 20, nullable: false})
    @Matches(/^[A-Z].{1,20}/, {message: 'Ship must start with a capital letter'})
    @IsIn(["Black Pearl", "Thousand Sunny", "Going Merry"],
        { message: 'Ship must be either Black Pearl, Thousand Sunny, or Going Merry (upper cases and lower cases matter)' })
    @IsNotEmpty({message: 'Ship name is required'})
    ship: string;
}