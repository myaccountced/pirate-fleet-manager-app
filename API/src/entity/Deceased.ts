import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";
import {IsIn, IsNotEmpty, IsOptional, Length, Matches} from "class-validator";

/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: Deceased.ts
 * Deceased entity
 */

@Entity()
export class Deceased {
    @PrimaryGeneratedColumn("uuid")
    @IsOptional()
    id: string;

    @Column({type: "varchar", length: 30, nullable: false})
    @Matches(/^[A-Z][\s\S]{0,29}$/, { message: 'Deceased name must start with a capital letter' })
    @Length(1, 30, {message: 'Deceased name must be 1 to 30 characters'})
    @IsNotEmpty({message: 'Deceased name is required'})
    name: string;

    @Column({type: "varchar", length: 20, nullable: false})
    @Matches(/^[A-Z].{1,20}/, {message: 'Crew type must start with a capital letter'})
    @IsIn(["Fighter", "Doctor", "Shipwright"],
        { message: 'Crew type must be either Fighter, Doctor, or Shipwright (upper cases and lower cases matter)' })
    @IsNotEmpty({message: 'Crew type is required'})
    crewType: string;

    @Column({type: "varchar", length: 30, nullable: false})
    @Length(1, 30, {message: 'Cause of death must be 1 to 30 characters'})
    @IsNotEmpty({message: 'Cause of death is required'})
    causeOfDeath: string;

    @Column({ type: "date", nullable: false })
    @IsNotEmpty({ message: 'Date of death is required' })
    date: string;

    @Column({type: "varchar", length: 20, nullable: false})
    @Matches(/^[A-Z].{1,20}/, {message: 'Ship must start with a capital letter'})
    @IsIn(["Black Pearl", "Thousand Sunny", "Going Merry"],
        { message: 'Ship must be either Black Pearl, Thousand Sunny, or Going Merry (upper cases and lower cases matter)' })
    @IsNotEmpty({message: 'Ship name is required'})
    ship: string;
}