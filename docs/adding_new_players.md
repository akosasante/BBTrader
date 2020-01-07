## Adding New Players To Database

- Using mLab (currently only for local development):
1. Log into [mLab](https://mlab.com/home?newLogin=1)
2. Check `/server/config/.env` file for table name
3. Add/Edit players from the UI

Using mongo server/client:
1. Ensure that `mongod` server is already running
2. Enter the command `mongo` to connect to the server
3. `show dbs`
4. `use ${enter name of db table as shown in env file}`
5. `show tables` to ensure that the `players` table is available
6. (Only if creating new user). `ObjectId()` to generate a new object ID. Copy this for use in step 9
7. Exit back to terminal.
8. Export the existing collection: `mongoexport --db ${table_name} --collection players --out ${filename}.json`
9. Make a copy of the exported collection JSON to add or update any rows. If a new ObjectId is required for a new player, use the one generated earlier. NOTE: Keep old copy as backup!
10. Run `node update_members ${new_exported_json} ${new_members_file_path} ${new_client_members_file_path}`
11. Confirm that the exported files look good and save them to `server/config/members.js` and `client/src/stores/PlayerStore.js` respectively


**Note:** New users will have to use the `/register` endpoint to set up their password.