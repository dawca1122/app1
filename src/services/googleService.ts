import { InventoryData } from '../lib/utils';

const TOKEN_DISTRIBUTOR_URL = 'https://token-distributor-23776009810.europe-west1.run.app';
const SPREADSHEET_ID = '1gTT53zuUTLwl-Da2qMRin7pLi5jlw6hHXGtw72W8sUw';

async function getAccessToken() {
  const response = await fetch(TOKEN_DISTRIBUTOR_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch access token from distributor');
  }
  const data = await response.json();
  // Handle various possible response structures from the distributor
  return data.access_token || data.tokens?.access_token || data.token || data.accessToken;
}

async function createDriveFolder(token: string, folderName: string, parentId?: string) {
  const body: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Failed to create Drive folder');
  }
  const data = await response.json();
  return data.id;
}

async function uploadToDrive(token: string, folderId: string, fileName: string, base64Data: string) {
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  // Convert base64 to blob
  const byteString = atob(base64Data.split(',')[1]);
  const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to Drive: ${fileName}`);
  }
  const data = await response.json();
  return data.id;
}

export async function getRecentInventory() {
  const token = await getAccessToken();
  const sheetResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:H`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!sheetResponse.ok) {
    throw new Error('Failed to fetch from Google Sheets');
  }

  const data = await sheetResponse.json();
  const rows = data.values || [];
  // Skip header if exists, get last 10
  const recent = rows.slice(-10).reverse();
  return recent.map((row: any) => ({
    date: row[0],
    ean: row[1],
    productName: row[2],
    amount: row[3],
    weee: row[4],
    folderUrl: row[5]
  }));
}

export async function saveInventoryToGoogle(data: InventoryData, settings: any) {
  const token = await getAccessToken();

  // Use settings or fallback to defaults
  const spreadsheetId = settings?.dataSourceId || SPREADSHEET_ID;
  const sheetName = settings?.targetSheetName || 'Sheet1';

  // 1. Create a folder for this product
  const folderName = `${data.ean} - ${data.productName}`;
  const folderId = await createDriveFolder(token, folderName, settings?.targetPhotoFolderId);

  // 2. Upload RAW photos
  const rawPhotoIds = await Promise.all(
    data.rawPhotos.map((photo, index) => 
      uploadToDrive(token, folderId, `RAW_${index + 1}.jpg`, photo)
    )
  );

  // 3. Upload PRO photos
  const proPhotoIds = await Promise.all(
    data.proPhotos.map((photo, index) => 
      uploadToDrive(token, folderId, `PRO_${index + 1}.jpg`, photo)
    )
  );

  // 4. Append to Google Sheets
  const row = [
    new Date().toISOString(),
    data.ean,
    data.productName,
    data.amount,
    data.weeeNumber || 'N/A',
    `https://drive.google.com/drive/folders/${folderId}`,
    rawPhotoIds.join(', '),
    proPhotoIds.join(', ')
  ];

  const sheetResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:A:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!sheetResponse.ok) {
    throw new Error('Failed to append row to Google Sheets');
  }

  return { folderId, folderUrl: `https://drive.google.com/drive/folders/${folderId}` };
}
