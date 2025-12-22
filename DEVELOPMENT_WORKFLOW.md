# How to Test Changes Before Going Live

## Quick Reference

**Production (Live Site)**:
- Branch: `main`
- URL: menguhan.com (after migration) or meng-portfolio.vercel.app
- What: The real website everyone sees

**Testing**:
- Branch: `dev`  
- URL: Auto-generated preview URL
- What: Your personal testing environment

---

## Step-by-Step: Testing New Changes

### 1. Switch to Dev Branch
```bash
git checkout dev
git pull origin dev  # Get latest version
```

### 2. Make Your Changes
- Edit any files (e.g., `personal.html` for weather effects)
- Save your changes

### 3. Push to Testing
```bash
git add .
git commit -m "Describe what you changed"
git push origin dev
```

### 4. Get Preview URL
- Check your email (Vercel sends deployment notifications)
- OR go to: https://vercel.com/dashboard
- Click on latest deployment
- Click "Visit" to see preview URL

### 5. Test Thoroughly
- Open preview URL
- Test all the changes you made
- Check on mobile too (if relevant)
- Verify weather effects work
- Make sure nothing broke

### 6. Deploy to Production (When Ready)
```bash
# Switch to main branch
git checkout main

# Merge your tested changes
git merge dev

# Push to production
git push origin main
```

### 7. Verify Live Site
- Wait 1-2 minutes for Vercel to deploy
- Check menguhan.com (or your production URL)
- Verify changes appear correctly

---

## Common Commands

**Check which branch you're on:**
```bash
git branch
```
The one with `*` is your current branch.

**See what files you changed:**
```bash
git status
```

**Undo local changes (before commit):**
```bash
git checkout -- filename.html
```

**See recent commits:**
```bash
git log --oneline -5
```

---

## Common Questions

**Q: How do I undo a change?**
A: If you haven't pushed to `main` yet, just don't merge it. If you have, we can roll back in Vercel.

**Q: Can I have multiple test branches?**
A: Yes! Create as many as you want (e.g., `feature-new-animation`). Each gets its own preview URL.

**Q: What if I forget which branch I'm on?**
A: Run `git branch` - the one with `*` is your current branch.

**Q: Can I test locally before pushing?**
A: Yes! Run `python -m http.server 8000` and visit `http://localhost:8000`

**Q: How long does preview deployment take?**
A: Usually 30-60 seconds. You'll get an email when it's ready.

**Q: What if the preview doesn't show my changes?**
A: Wait a minute, then hard refresh (Ctrl+F5 or Cmd+Shift+R) to clear cache.

---

## Emergency Rollback

If something breaks on production:

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click on "Deployments"
3. Find a previous working deployment
4. Click "..." → "Promote to Production"
5. Your site instantly reverts to that version

---

## Workflow Tips

**Before making big changes:**
1. Always start from the latest `dev` branch
2. Pull latest changes: `git pull origin dev`
3. Make your changes
4. Test on preview URL FIRST
5. Only merge to `main` when confident

**If you mess up locally:**
1. Stash your changes: `git stash`
2. Reset to clean state: `git reset --hard origin/dev`
3. Re-apply your changes: `git stash pop` (if you want them back)

**Good commit messages:**
- ✅ "Add new rain particle effects to weather system"
- ✅ "Fix: Weather animation timing issue"
- ✅ "Update: Improve snow rendering performance"
- ❌ "changes"
- ❌ "update"
- ❌ "fix"

---

## Branch Strategy

```
main (production)
  └── Always stable, always working
  └── Only merge tested code
  └── Auto-deploys to menguhan.com

dev (testing)
  └── Your experimental playground
  └── Test freely here
  └── Auto-deploys to preview URL
  └── Merge to main when ready
```

---

## Next Steps

Now that you have this workflow set up, you can:

1. **Work on weather animations** safely on the `dev` branch
2. **Test changes** on preview URLs before going live
3. **Deploy confidently** knowing production won't break
4. **Roll back instantly** if something goes wrong

Happy coding! 🚀
