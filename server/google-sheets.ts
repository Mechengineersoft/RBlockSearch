import { google } from "googleapis";
import { SearchResult, InsertUser, User } from "@shared/schema";
import { config } from './config';

interface DisReportResult {
  blockNo: string;
  thickness: string;
  o_column: string;
  p_column: string;
  q_column: string;
  r_column: string;
}

const auth = new google.auth.GoogleAuth({
  credentials: config.googleServiceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = config.googleSheetsId;

export async function getDisReportData(blockNo: string, thickness?: string): Promise<DisReportResult[]> {
  try {
    console.log('Starting Dis Report search with params:', { blockNo, thickness });

    // Validate input parameters
    if (!blockNo || blockNo.trim() === '') {
      console.log('Block number is empty or undefined');
      return [];
    }

    // Specify the range for columns O through R in the "Data2" tab
    const range = "Data2!O:R"; // Fetch all rows from columns O-R
    console.log('Fetching from range:', range);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
      valueRenderOption: 'UNFORMATTED_VALUE', // Get the raw values
    });

    if (!response.data.values) {
      console.log('No data found in sheet');
      return [];
    }

    console.log(`Found ${response.data.values.length} rows in sheet`);

    // Filter and map the rows to DisReportResult objects
    const results = response.data.values
      .filter(row => {
        if (!row[0]) { // Column O (block number)
          console.log('Skipping row with no block number in column O');
          return false;
        }

        const rowBlockNo = String(row[0]).toLowerCase().trim(); // Column O
        const rowThickness = row[1] ? String(row[1]).toLowerCase().trim() : ''; // Column P
        const searchBlockNo = blockNo.toLowerCase().trim();
        const searchThickness = thickness ? thickness.toLowerCase().trim() : '';

        console.log('Comparing values:', {
          rowBlockNo,
          searchBlockNo,
          rowThickness,
          searchThickness
        });

        const matchesBlock = rowBlockNo === searchBlockNo;
        const matchesThickness = !searchThickness || rowThickness === searchThickness;

        console.log('Match results:', {
          matchesBlock,
          matchesThickness
        });

        if (matchesBlock && matchesThickness) {
          console.log('Found matching row for Dis Report:', row);
        }

        return matchesBlock && matchesThickness;
      })
      .map((row): DisReportResult => ({
        blockNo: row[0] || '', // Column O
        thickness: row[1] || '', // Column P
        o_column: row[0] || '', // Column O
        p_column: row[1] || '', // Column P
        q_column: row[2] || '', // Column Q
        r_column: row[3] || '', // Column R
      }));

    console.log(`Returning ${results.length} Dis Report results`);
    return results;
  } catch (error) {
    console.error('Error in getDisReportData:', error);
    throw error;
  }
}

interface DisRptResult {
  blockNo: string;
  partNo: string;
  thickness: string;
  nos: string;
  m2: string;
}

export async function getDisRptData(blockNo: string, partNo?: string, thickness?: string): Promise<DisRptResult[]> {
  try {
    console.log('Starting main page 2 search with params:', { blockNo, partNo, thickness });

    // Specify the exact range in the "Data3" tab
    const range = "Data3!A2:E"; // Columns A through E, starting from row 2
    console.log('Fetching from range:', range);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    if (!response.data.values) {
      console.log('No data found in sheet');
      return [];
    }

    console.log(`Found ${response.data.values.length} rows in sheet`);

    // Filter and map the rows to DisRptResult objects
    const results = response.data.values
      .filter(row => {
        if (!row[0]) {
          console.log('Skipping row with no block number');
          return false;
        }

        const rowBlockNo = row[0].toString().toLowerCase();
        const rowPartNo = row[1]?.toString().toLowerCase() || '';
        const rowThickness = row[2]?.toString().toLowerCase() || '';

        const matchesBlock = rowBlockNo === blockNo.toLowerCase();
        const matchesPart = !partNo || rowPartNo === partNo.toLowerCase();
        const matchesThickness = !thickness || rowThickness === thickness.toLowerCase();

        const matches = matchesBlock && matchesPart && matchesThickness;
        if (matches) {
          console.log('Found matching row:', row);
        }

        return matches;
      })
      .map((row): DisRptResult => ({
        blockNo: row[0] || '',
        partNo: row[1] || '',
        thickness: row[2] || '',
        nos: row[3] || '',
        m2: row[4] || ''
      }));

    console.log(`Returning ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Error in getDisRptData:', error);
    throw error;
  }
}

export async function searchSheetData(blockNo: string, partNo?: string, thickness?: string): Promise<SearchResult[]> {
  try {
    console.log('Starting search with params:', { blockNo, partNo, thickness });

    // Specify the exact range in the "Data2" tab
    const range = "Data2!A2:L"; // Columns A through L, starting from row 2
    console.log('Fetching from range:', range);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });


    if (!response.data.values) {
      console.log('No data found in sheet');
      return [];
    }

    console.log(`Found ${response.data.values.length} rows in sheet`);

    // First, map the rows to full SearchResult objects
    const fullResults = response.data.values
      .filter(row => {
        if (!row[0]) {
          console.log('Skipping row with no block number');
          return false;
        }

        const rowBlockNo = row[0].toString().toLowerCase();
        const rowPartNo = row[1]?.toString().toLowerCase() || '';
        const rowThickness = row[2]?.toString().toLowerCase() || '';

        const matchesBlock = rowBlockNo === blockNo.toLowerCase();
        const matchesPart = !partNo || rowPartNo === partNo.toLowerCase();
        const matchesThickness = !thickness || rowThickness === thickness.toLowerCase();

        const matches = matchesBlock && matchesPart && matchesThickness;
        if (matches) {
          console.log('Found matching row:', row);
        }

        return matches;
      })
      .map((row): SearchResult => ({
        blockNo: row[0] || '',
        partNo: row[1] || '',
        thickness: row[2] || '',
        nos: row[3] || '',
        lCm: row[4] || '',
        hCm: row[5] || '',
        wCm: row[6] || '',
        status: row[7] || '',
        date: row[8] || '',
        mc: row[9] || '',
        color1: row[10] || '',
        color2: row[11] || ''
      }));

    // Identify columns that have data in at least one result
    const columnsWithData = new Set<string>();
    
    // Always include these essential columns regardless of data
    columnsWithData.add('blockNo');
    columnsWithData.add('partNo');
    columnsWithData.add('thickness');
    
    // Check each result to find columns with data
    fullResults.forEach(result => {
      Object.entries(result).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          columnsWithData.add(key);
        }
      });
    });
    
    console.log('Columns with data:', Array.from(columnsWithData));
    
    // Filter each result to only include columns with data
    const results = fullResults.map(result => {
      const filteredResult: Partial<SearchResult> = {};
      
      columnsWithData.forEach(column => {
        filteredResult[column as keyof SearchResult] = result[column as keyof SearchResult];
      });
      
      return filteredResult as SearchResult;
    });

    console.log(`Returning ${results.length} results with ${columnsWithData.size} columns`);
    return results;
  } catch (error) {
    console.error('Error in searchSheetData:', error);
    throw error;
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const range = "User!A2:C";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = response.data.values || [];
    const userRow = values.find((row) => row[1]?.toString().toLowerCase() === username.toLowerCase());

    if (!userRow) return undefined;

    return {
      id: parseInt(userRow[0]),
      username: userRow[1],
      password: userRow[2]
    };
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    return undefined;
  }
}

export async function getUser(id: number): Promise<User | undefined> {
  try {
    const range = "User!A2:C";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = response.data.values || [];
    const userRow = values.find((row) => parseInt(row[0]) === id);

    if (!userRow) return undefined;

    return {
      id: parseInt(userRow[0]),
      username: userRow[1],
      password: userRow[2]
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return undefined;
  }
}

export async function createUser(user: InsertUser): Promise<User> {
  try {
    // Check if username already exists
    const range = "User!A2:C";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = response.data.values || [];
    const existingUsername = values.find((row) => row[1]?.toString().toLowerCase() === user.username.toLowerCase());

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // First, check if the User sheet exists and create it if it doesn't
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });

    const userSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'User'
    );

    if (!userSheet) {
      // Create User sheet with headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'User',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 3
                }
              }
            }
          }]
        }
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'User!A1:D1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Username', 'Password', 'Email']]
        }
      });
    }

    // Get current users to determine next ID
    const userRange = "User!A2:C";
    const userResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: userRange,
    });

    const userValues = userResponse.data.values || [];
    const newId = userValues.length > 0 
      ? Math.max(...userValues.map(row => parseInt(row[0] || '0'))) + 1 
      : 1;

    const newUser: User = {
      id: newId,
      username: user.username,
      password: user.password
    };

    // Append new user
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "User!A:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [[newUser.id, newUser.username, newUser.password, user.email]]
      }
    });

    return newUser;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error('Failed to create user');
  }
}
