# Vercel Environment Configuration for BaliBuddy PWA

## Mapbox Access Token Setup

### Step 1: Get Your Mapbox Token
1. Go to https://account.mapbox.com
2. Sign in or create a free account
3. Copy your default public token (starts with `pk.`)

### Step 2: Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add Environment Variable**
4. Add the following:
   - **Name:** `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - **Value:** `pk.eyJ1Ijoi...` (your full token)
   - **Environment:** Select all (Production, Preview, Development)

### Step 3: Redeploy
After adding the environment variable, trigger a new deployment:
```bash
git push
# or
vercel --prod
```

## Important Notes

### Client-Side Exposure
- The `EXPO_PUBLIC_` prefix is **REQUIRED** for the variable to be exposed to the client bundle
- Without this prefix, the variable will only be available server-side
- Vercel automatically injects these variables at build time

### Build Command
Ensure your Vercel build command is:
```bash
npx expo export -p web
```

### Output Directory
Vercel should be configured to use:
```
dist/
```

### Fallback Behavior
If the token is missing or invalid:
- The app automatically falls back to CartoDB maps (free, no token required)
- A beautiful overlay informs the user to reload or check configuration
- No crashes or black screens

## Local Development

Create a `.env` file in the project root:
```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
```

⚠️ **Never commit `.env` to Git!** It's already in `.gitignore`.

## Troubleshooting

### Token Not Working?
1. Verify the variable name is exactly `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
2. Check the token starts with `pk.`
3. Ensure token has at least 20 characters
4. Redeploy after adding/changing variables

### Map Shows "Invalid Token"?
- Check token permissions in Mapbox dashboard
- Ensure token has "Styles" and "Tiles" scopes enabled

### Still Using CartoDB Fallback?
- Check browser console for warning messages
- Verify environment variable is loaded: `console.log(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN)`
