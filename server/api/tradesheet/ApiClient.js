const google = require('googleapis').google;
const path = require('path');

class SpreadsheetAPI {
    constructor() {
        this.authClient = null;
        this.sheets = null;
        this.sheetId = process.env.NODE_ENV === 'development' ? process.env.SPREADSHEET_ID_DEV : process.env.SPREADSHEET_ID_PROD;
    }

    async getSheetsClient() {
        if(!this.authClient) {
            this.authClient = await google.auth.getClient({
                keyFile: path.join(__dirname, '../../../', 'creds.json'),
                scopes: 'https://www.googleapis.com/auth/spreadsheets'
            });
        }
        if(!this.sheets) {
            this.sheets = google.sheets({version: 'v4', auth: this.authClient});
        }
        return this;
    }

    readSheet(range) {
        const readRequest = {
            spreadsheetId: this.sheetId,
            range: range,
            auth: this.authClient
        };
        this.sheets.spreadsheets.values.get(readRequest, function(err, response) {
            if(err) {
                console.error(err);
                return;
            }
            console.log(JSON.stringify(response.data, null, 2));
        });
    }

    appendToSheet(range, data, cb) {
        const appendRequest = {
            spreadsheetId: this.sheetId,
            range: range,
            auth: this.authClient,
            valueInputOption: "USER_ENTERED",
            includeValuesInResponse: true,
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: data
            }
        };
        this.sheets.spreadsheets.values.append(appendRequest, cb);
    }
}

module.exports = SpreadsheetAPI;