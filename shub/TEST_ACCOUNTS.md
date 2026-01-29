# Test Accounts for Local Development

## Method 1: Manual Signup Through App

### Test Host Account
**Go to:** http://localhost:5174/

**Signup Steps:**
1. Click "Sign Up"
2. Select "Host" user type
3. Enter details:
   ```
   Name: Alex Thompson
   Email: alex.test@example.com
   Password: TestHost123!
   ```

### Test Client Account
1. Click "Sign Up"
2. Select "Client" user type
3. Enter details:
   ```
   Name: Jamie Wilson
   Email: jamie.test@example.com
   Password: TestClient123!
   ```

## Method 2: If Email Verification is Blocking

If Supabase requires email verification and you can't access the verification emails:

### Option A: Use Real Email
- Use your actual email address for testing
- Check your inbox for verification email

### Option B: Disable Email Verification (Temporary)
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Temporarily disable "Enable email confirmations"

## Method 3: Quick Browser Test

### Use Browser Console to Test Auth
1. Open http://localhost:5174/
2. Press F12 (Dev Tools)
3. Go to Console tab
4. Run this test:

```javascript
// Test Supabase connection
console.log('Testing Supabase...');
// This should show the Supabase client object
console.log(window.supabase || 'Supabase not available on window');
```

## Troubleshooting

### If Login/Signup Fails:
1. **Check browser console** (F12) for error messages
2. **Verify .env file** has correct Supabase credentials
3. **Check Supabase dashboard** for auth settings
4. **Try incognito mode** to rule out browser cache issues

### Common Issues:
- ❌ **Email verification required** → Use real email or disable in Supabase
- ❌ **RLS policies blocking** → Check Supabase RLS settings
- ❌ **Invalid credentials** → Verify .env file
- ❌ **Network errors** → Check Supabase project status

## Success Indicators
✅ **App loads** at http://localhost:5174/
✅ **Can navigate** between landing/login/signup
✅ **No console errors** in browser dev tools
✅ **Can create account** and receive success message
✅ **Can access host dashboard** after signup

## Current Working Credentials (if auth user was created)
- Email: testhost@shub.local
- Password: TestHost123!
- Status: Auth user created, profile may need completion