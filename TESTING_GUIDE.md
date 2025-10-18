# Security Testing Guide

## Automated Tests

### Run the Security Test Suite

```bash
npm run test-security
```

This will automatically test:
- ✅ Public API endpoints (should work without auth)
- ✅ AI endpoints without auth (should return 401)
- ✅ Delete endpoints without auth (should return 401)

---

## Manual Tests (Required)

### 1. **Test Middleware Protection**

**Objective**: Verify `/admin` route requires authentication

**Steps**:
1. Open a **private/incognito browser window**
2. Navigate to `http://localhost:3000/admin`
3. **Expected**: Should redirect to `/admin/login`
4. **If it doesn't redirect**: ❌ Middleware is not working

---

### 2. **Test Login Flow**

**Objective**: Verify authentication works correctly

**Steps**:
1. Go to `http://localhost:3000/admin/login`
2. Enter your admin credentials:
   - Email: `your-admin@email.com`
   - Password: `your-password`
3. Click **Login**
4. **Expected**: Should redirect to `/admin` dashboard
5. **Verify**: User info shows in sidebar with 👑 Admin badge

---

### 3. **Test Editor Cannot Delete**

**Objective**: Verify role-based access control

**Steps**:
1. Create an editor user in Supabase (if not already done)
2. Logout from admin account
3. Login with editor credentials
4. Go to `/admin/themes` or `/admin/components`
5. **Expected**: 
   - ✅ Can see all themes/components
   - ✅ Can click "Edit" button
   - ❌ **No "Delete" button visible**
6. **Verify**: User info shows ✏️ Editor (not Admin)

**Bonus Test** (Advanced):
- Try to delete using browser DevTools console:
  ```javascript
  fetch('/api/admin/themes/some-id', { method: 'DELETE' })
    .then(r => r.json())
    .then(console.log)
  ```
- **Expected**: Should return `403 Forbidden` with error message

---

### 4. **Test Admin Can Delete**

**Objective**: Verify admin has full permissions

**Steps**:
1. Login as admin
2. Go to `/admin/themes`
3. **Expected**: 
   - ✅ "Delete" button IS visible
   - ✅ Can successfully delete themes (except active one)
4. Try deleting the **active theme**
   - **Expected**: Should show error "Cannot delete active theme"

---

### 5. **Test AI Features Require Auth**

**Objective**: Verify AI endpoints are protected

**Steps**:
1. Logout completely
2. Open browser DevTools (F12)
3. In Console tab, try to call AI API:
   ```javascript
   fetch('http://localhost:3000/api/ai/generate-component', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: 'TestButton' })
   })
   .then(r => r.json())
   .then(console.log)
   ```
4. **Expected**: Should return `{ error: "Authentication required" }` with status 401

**Then Login and Test**:
1. Login as any user (admin or editor)
2. Go to `/admin/components/new`
3. Try using AI generation features
4. **Expected**: Should work! ✅

---

### 6. **Test Session Persistence**

**Objective**: Verify sessions persist across page refreshes

**Steps**:
1. Login as admin
2. Navigate to `/admin/themes`
3. **Refresh the page** (F5)
4. **Expected**: Still logged in, no redirect to login
5. Close browser completely
6. Reopen and go to `http://localhost:3000/admin`
7. **Expected**: 
   - If you closed within session timeout: Still logged in
   - If session expired: Redirect to login

---

### 7. **Test Public Access**

**Objective**: Verify public routes work without auth

**Steps**:
1. Open **private/incognito window** (not logged in)
2. Go to `http://localhost:3000`
3. Click "Browse Components"
4. **Expected**: Can see all components without logging in
5. Try accessing a component detail page
6. **Expected**: Works! Public documentation is accessible

---

## Quick Test Checklist

Use this for quick regression testing:

- [ ] Homepage loads
- [ ] `/admin` redirects to login when not authenticated
- [ ] Login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Admin sees delete buttons
- [ ] Editor does NOT see delete buttons
- [ ] Admin can delete themes/components
- [ ] Editor gets 403 when trying to delete via API
- [ ] AI features require authentication
- [ ] AI features work when authenticated
- [ ] Logout works
- [ ] Public routes accessible without auth
- [ ] Session persists across page refreshes

---

## Testing After Deployment

When deployed to Vercel, test:

1. **Environment Variables**:
   - Verify Supabase keys are set
   - Verify Claude API key is set
   - Check all features work in production

2. **HTTPS**:
   - All auth flows work over HTTPS
   - Cookies are set correctly
   - No mixed content warnings

3. **Performance**:
   - Middleware doesn't slow down requests
   - Auth checks are fast
   - Database queries are optimized

---

## Troubleshooting

### "Authentication Required" when logged in
- Clear cookies and login again
- Check browser console for errors
- Verify environment variables are loaded

### Delete button not showing for admin
- Check user role in Supabase dashboard
- Verify `usePermissions` hook is working
- Check browser console for errors

### AI features not working
- Verify `ANTHROPIC_API_KEY` is set
- Check API key has credits
- Look at server logs for errors

### Redirects not working
- Clear Next.js cache: `rm -rf .next`
- Restart dev server
- Check middleware.ts config

---

## Need Help?

If any tests fail:
1. Check the browser console (F12)
2. Check the server terminal logs
3. Review `SECURITY_AUDIT.md` for common issues
4. Verify environment variables in `.env.local`

---

**Happy Testing!** 🧪🔒

