# Run the app
To run the backend
1. Navigate to the API folder by entering: `cd API`
2. Install the dependencies by entering: `npm i`
3. Run it by entering: `npm start`

To run the frontend - in a separate terminal
1. Navigate to the UI folder by entering: `cd UI`
2. Install the dependencies by entering: `npm i`
3. Run it by entering: `npm run dev`

# Log-in using a valid account
1. Navigate to this page: http://localhost:5173/
2. Enter valid credentials, currently there are two valid accounts.
3. User account with a READ access level:
   - Username: `userread`
   - Password: `userread1`
   - This user account can only see the tables in the app.
4. User account with a WRITE access level:
    - Username: `userwrite`
    - Password: `userwrite1`
    - This user account can: see the tables, add fighters, add doctors, add shipwrights, 
   transfer members to a different ship, and move members to the graveyard list.

# Log-out
1. Press the `Sign Out` button located at the top-right of the page.

# Fighters Page Functionalities
1. The Fighters table displays a list of fighters.
   - You can filter by ship using the search bar.
   - You can sort by all the columns.
   - Allows multiple sorts.
2. The `Add a fighter` button will only be visible to users with WRITE access level. 
Pressing this button will show you a form that allows you to add a fighter to the table. 
3. The `💀` button will only be visible to users with WRITE access level.
This appears to the left of every record.
Pressing this button will show you a form that allows you to move the fighter to the graveyard.
4. The `⚓` button will only be visible to users with WRITE access level.
This appears to the right of every record.
Pressing this button will show you a form that allows you to transfer the fighter to a different ship.

# Doctors Page and Shipwrights Page Functionalities
1. Includes the same functionalities as the Fighters page. But the columns are different 
(except the name and the ship column).

# Graveyard Page Functionalities
1. The Deceased table displays a list of dead members.
    - You can filter by ship using the search bar.
    - You can sort by all the columns.
    - Allows multiple sorts.