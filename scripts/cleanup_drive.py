import json
import os
from googleapiclient.discovery import build
from google.oauth2 import service_account

creds_json = os.environ["GDRIVE_CREDENTIALS_JSON"]
folder_id = os.environ["GDRIVE_FOLDER_ID"]

creds = service_account.Credentials.from_service_account_info(json.loads(creds_json))
service = build("drive", "v3", credentials=creds)

results = service.files().list(
    q=f"'{folder_id}' in parents and trashed=false",
    fields="files(id, name, createdTime)",
    orderBy="createdTime desc",
).execute()

files = results.get("files", [])

for f in files[7:]:
    service.files().delete(fileId=f["id"]).execute()
    print(f"🗑️ Deleted old backup: {f['name']}")
