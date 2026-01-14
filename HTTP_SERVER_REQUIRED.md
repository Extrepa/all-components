# HTTP Server Required

## ⚠️ Important: This page must be served via HTTP

The component preview system **cannot work** when opened directly as a file (`file://` protocol) due to browser security restrictions (CORS).

## Quick Start

### 1. Start HTTP Server

From the `all-components` directory:

```bash
python3 -m http.server 8000
```

### 2. Open in Browser

Open: **`http://localhost:8000/preview.html`**

**NOT:** `file:///Users/extrepa/Projects/all-components/preview.html`

## Why HTTP Server is Required

1. **CORS Restrictions:** Browsers block `fetch()` requests to local files
2. **Component Data:** `components-data.json` must be loaded via HTTP
3. **Preview System:** React preview iframes need HTTP access
4. **Asset Loading:** All relative paths work correctly with HTTP

## Alternative Servers

### Python (recommended)
```bash
python3 -m http.server 8000
```

### Node.js
```bash
npx http-server -p 8000
```

### PHP
```bash
php -S localhost:8000
```

## Troubleshooting

### Still seeing CORS errors?
- Make sure you're using `http://localhost:8000/preview.html`
- Not `file:///.../preview.html`
- Check that server is running on port 8000

### Components not loading?
- Check browser console for errors
- Verify `components-data.json` is accessible at `http://localhost:8000/components-data.json`
- The page will use embedded data as fallback if JSON can't load

---

**Always use HTTP server for this preview system!**
