# Firebase Storage Rules Configuration

To fix the "storage/unknown" error, you need to configure Firebase Storage security rules in your Firebase Console.

## Steps to Configure:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `ies-portal-179b7`
3. Navigate to **Storage** → **Rules**
4. Update the rules to allow authenticated users to upload files:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files to the uploads folder
    match /uploads/{portId}/{year}/{month}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Allow authenticated users to read/write port documents
    match /ports/{portId}/documents/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Default: deny all access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Alternative (Less Secure - For Testing):

If you want to allow all authenticated users to upload (for testing purposes):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Important Notes:

- The rules above require users to be authenticated
- Admin-only uploads are enforced for the `/uploads/` path
- Make sure to publish the rules after updating them
- The error "storage/unknown" often indicates permission issues

