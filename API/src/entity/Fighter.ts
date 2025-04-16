import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";
import {IsIn, IsNotEmpty, IsOptional, IsPositive, Length, Matches, Max, Min} from "class-validator";

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Fighter.ts
 * Fighter entity
 */

@Entity()
export class Fighter {
    @PrimaryGeneratedColumn("uuid")
    @IsOptional()
    id: string;

    @Column({type: "varchar", length: 30, nullable: false})
    @Matches(/^[A-Z][\s\S]{0,29}$/, { message: 'Pirate name must start with a capital letter' })
    @Length(1, 30, {message: 'Pirate name must be 1 to 30 characters'})
    @IsNotEmpty({message: 'Pirate name is required'})
    name: string;

    @Column({type: "varchar", length: 20, nullable: false})
    @Matches(/^[A-Z].{1,20}/, {message: 'Rank must start with a capital letter'})
    @IsIn(["Vice-Captain", "Crew", "Master-at-Arms"],
        { message: 'Rank must be either Vice-Captain, Crew, or Master-at-Arms (upper cases and lower cases matter)' })
    @IsNotEmpty({message: 'Rank is required'})
    rank: string;

    @Column({type: "integer", width: 3, nullable: false})
    @Max(100, {message: 'Strength must be 100 or less'})
    @Min(1, {message: 'Strength must be 1 or greater'})
    @IsPositive({message: 'Strength level should be positive'})
    @IsNotEmpty({message: 'Strength level is required'})
    strength: number;

    @Column({type: "varchar", length: 20, nullable: false})
    @Length(1, 20, {message: 'Weapon must be 1 to 20 characters'})
    @IsNotEmpty({message: 'Weapon is required'})
    weapon: string;

    @Column({type: "varchar", length: 20, nullable: false})
    @Matches(/^[A-Z].{1,20}/, {message: 'Ship must start with a capital letter'})
    @IsIn(["Black Pearl", "Thousand Sunny", "Going Merry"],
        { message: 'Ship must be either Black Pearl, Thousand Sunny, or Going Merry (upper cases and lower cases matter)' })
    @IsNotEmpty({message: 'Ship name is required'})
    ship: string;
}