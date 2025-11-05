# 🗺️ Google Maps API Setup Guide

## Quick Setup (5 minutes)

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Create a new project or select existing one
3. Click "Create Credentials" → "API Key"
4. Copy the generated API key

### 2. Enable Required APIs
In Google Cloud Console, enable these APIs:
- **Maps JavaScript API** (required)
- **Places API** (optional, for enhanced features)
- **Geocoding API** (optional, for address lookup)

### 3. Configure Your App
Create a `.env.local` file in your frontend directory:

```bash
# Add this to frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Restart Your App
```bash
cd frontend
npm run dev
```

## Features You'll Get

✅ **Interactive Map**: Smooth, responsive Google Maps
✅ **Hospital Markers**: All 1,342 hospitals with custom icons
✅ **Info Windows**: Click markers for hospital details
✅ **Auto-fit Bounds**: Map automatically shows all hospitals
✅ **Professional UI**: Clean, modern interface
✅ **Mobile Friendly**: Works perfectly on all devices

## Cost Information

- **Free Tier**: $200/month credit (covers ~28,000 map loads)
- **Per Load**: ~$0.007 per map load after free tier
- **For 1,000 users/day**: ~$2/month

## Troubleshooting

### Map Not Loading?
- Check your API key is correct
- Ensure Maps JavaScript API is enabled
- Verify the API key has no restrictions

### Getting Errors?
- Check browser console for specific error messages
- Verify your domain is allowed in API key restrictions
- Make sure billing is enabled on your Google Cloud project

## Security Best Practices

1. **Restrict API Key**: Add HTTP referrer restrictions
2. **Monitor Usage**: Set up billing alerts
3. **Rotate Keys**: Regularly update your API keys

---

**Need Help?** Check the [Google Maps documentation](https://developers.google.com/maps/documentation/javascript) for more details.
