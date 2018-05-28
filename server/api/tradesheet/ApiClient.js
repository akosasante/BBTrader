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

    appendToSheet(data, cb) {
        const WORKSHEET_INDEX = process.env.NODE_ENV === 'development' ? process.env.WORKSHEET_ID_DEV : process.env.WORKSHEET_ID_PROD;
        const START_ROW_INDEX = 1;
        const END_ROW_INDEX = 2;
        const START_COLUMN_INDEX = 0;

        /* We will insert the new empty rows on the sheet indicated by 0-index,
 starting at START_ROW_INDEX (inclusive) and stopping by END_ROW_INDEX (exclusive)
        */
        const insertEmptyValuesRequest = {
            insertDimension: {
                range: {
                    sheetId: WORKSHEET_INDEX,
                    dimension: "ROWS",
                    startIndex: START_ROW_INDEX,
                    endIndex: END_ROW_INDEX
                }
            }
        };
        const insertTradeDataRequest = {
            updateCells: {
                rows: [
                    { values: [
                        data.map(datum => ({ userEnteredValue: { stringValue: datum } }))
                        ]
                    }
                ],
                start: {
                    sheetId: WORKSHEET_INDEX,
                    rowIndex: START_ROW_INDEX,
                    columnIndex: START_COLUMN_INDEX
                },
                fields: "*"
            }
        };

        const batchUpdateRequest = {
            spreadsheetId: this.sheetId,
            auth: this.authClient,
            resource: {
                requests: [insertEmptyValuesRequest, insertTradeDataRequest]
            }
        };

        this.sheets.spreadsheets.batchUpdate(batchUpdateRequest, cb);
    }
}

module.exports = SpreadsheetAPI;