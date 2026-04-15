# Device API - Usage Guide

## Creating a Device with Game IDs

### Issue: "gameIds must be an array"

When sending `multipart/form-data`, arrays need special handling. Here are the correct ways to send `gameIds`:

### Option 1: Send as JSON String (Recommended)

```bash
POST /admin/device/shop/{shopId}/branch/{branchId}
Content-Type: multipart/form-data

name: PS5 Room 1
deviceType: PS5
roomHourlyPrice: 100
singleHourlyPrice: 80
multiplayerHourlyPrice: 60
gameIds: ["uuid-1", "uuid-2", "uuid-3"]  # JSON array as string
image: [file]
```

### Option 2: Send Multiple Fields (Postman/Form)

In Postman or HTML forms, send multiple fields with the same name:

```
gameIds[]: uuid-1
gameIds[]: uuid-2
gameIds[]: uuid-3
```

### Option 3: Omit gameIds (Optional)

If you don't want to associate games yet, simply don't send the `gameIds` field:

```bash
POST /admin/device/shop/{shopId}/branch/{branchId}
Content-Type: multipart/form-data

name: PS5 Room 1
deviceType: PS5
roomHourlyPrice: 100
singleHourlyPrice: 80
multiplayerHourlyPrice: 60
image: [file]
# No gameIds field
```

## Using cURL

### With Game IDs

```bash
curl -X POST \
  http://localhost:3000/admin/device/shop/SHOP_UUID/branch/BRANCH_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'name=PS5 Room 1' \
  -F 'deviceType=PS5' \
  -F 'roomHourlyPrice=100' \
  -F 'singleHourlyPrice=80' \
  -F 'multiplayerHourlyPrice=60' \
  -F 'gameIds=["game-uuid-1","game-uuid-2"]' \
  -F 'image=@/path/to/image.jpg'
```

### Without Game IDs

```bash
curl -X POST \
  http://localhost:3000/admin/device/shop/SHOP_UUID/branch/BRANCH_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'name=PS5 Room 1' \
  -F 'deviceType=PS5' \
  -F 'roomHourlyPrice=100' \
  -F 'singleHourlyPrice=80' \
  -F 'multiplayerHourlyPrice=60' \
  -F 'image=@/path/to/image.jpg'
```

## Using Postman

1. Select `POST` method
2. Enter URL: `http://localhost:3000/admin/device/shop/{shopId}/branch/{branchId}`
3. Go to `Authorization` tab → Select `Bearer Token` → Paste your JWT
4. Go to `Body` tab → Select `form-data`
5. Add fields:

| Key | Value | Type |
|-----|-------|------|
| name | PS5 Room 1 | Text |
| deviceType | PS5 | Text |
| roomHourlyPrice | 100 | Text |
| singleHourlyPrice | 80 | Text |
| multiplayerHourlyPrice | 60 | Text |
| gameIds | ["uuid-1","uuid-2"] | Text |
| image | [Select File] | File |

**Note:** For `gameIds`, paste the JSON array as a string: `["uuid-1","uuid-2"]`

## Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('name', 'PS5 Room 1');
formData.append('deviceType', 'PS5');
formData.append('roomHourlyPrice', '100');
formData.append('singleHourlyPrice', '80');
formData.append('multiplayerHourlyPrice', '60');

// Option 1: Send as JSON string
formData.append('gameIds', JSON.stringify(['uuid-1', 'uuid-2']));

// Option 2: Send multiple values
// formData.append('gameIds[]', 'uuid-1');
// formData.append('gameIds[]', 'uuid-2');

// Add image file
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3000/admin/device/shop/SHOP_UUID/branch/BRANCH_UUID', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

## Update Device with Game IDs

Same rules apply for `PUT /admin/device/:id`:

```bash
curl -X PUT \
  http://localhost:3000/admin/device/DEVICE_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'name=Updated Name' \
  -F 'gameIds=["new-uuid-1","new-uuid-2"]'
```

**Note:** When updating, `gameIds` replaces ALL existing game associations. To keep existing games, include all UUIDs.

## Error Handling

### Error: "gameIds must be an array"

**Cause:** Sent `gameIds` as a plain string without JSON formatting

**Solution:** Wrap in JSON array brackets: `["uuid-1","uuid-2"]`

### Error: "each value in gameIds must be a UUID"

**Cause:** Invalid UUID format

**Solution:** Ensure all game IDs are valid UUIDs (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Error: "gameIds must be a valid UUID"

**Cause:** Sent a single UUID without array brackets

**Solution:** Even for one game, use array: `["uuid-1"]`

## Improved Error Logging

All errors are now logged with full details:

```
[AdminDeviceService] Failed to create device: Validation failed
  at AdminDeviceService.createDevice (device.service.ts:75:13)
  ...
```

Check your server logs for detailed error messages when requests fail.

## Testing Checklist

- [ ] Create device without gameIds
- [ ] Create device with single gameId: `["uuid"]`
- [ ] Create device with multiple gameIds: `["uuid1","uuid2"]`
- [ ] Create device with image
- [ ] Update device gameIds (replaces all)
- [ ] Update device without gameIds (keeps existing)
- [ ] Verify error messages are clear
- [ ] Check server logs show detailed errors
