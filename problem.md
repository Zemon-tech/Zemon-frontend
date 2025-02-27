# Build Errors

## React Hook Dependency Warnings
✅ Fixed:
- dashboard/[username]/page.tsx: Added 'toast' to useEffect dependencies
- repos/page.tsx: Added 'fetchRepos' using useCallback
- store/[id]/page.tsx: Added 'fetchStoreItem' using useCallback
- store/page.tsx: Added 'fetchStoreItems' using useCallback
- repos/tabs/OverviewTab.tsx: Removed unnecessary 'repoInfo' dependency from useMemo

## Next.js Image Optimization Warnings
✅ Fixed:
- dashboard/[username]/page.tsx: Replaced img with Next.js Image component
- store/[id]/page.tsx: Replaced img with Next.js Image component
- repos/tabs/OverviewTab.tsx: Replaced img with Next.js Image component

Still to fix:
- events/[id]/page.tsx: Using `<img>` instead of Next.js `<Image>` component
- news/[id]/page.tsx: Using `<img>` instead of Next.js `<Image>` component
- repos/[id]/page.tsx: Using `<img>` instead of Next.js `<Image>` component

## TypeScript/ESLint Errors

### Unused Variables and Imports
✅ Fixed:
- repos/page.tsx: Removed unused imports ('motion', 'ArrowUpDown', 'handleCardClick')
- store/page.tsx: Removed unused imports ('ConfirmDialog', 'PageHeader', 'GridLayout', 'motion', 'filterOptions')
- repos/tabs/OverviewTab.tsx: Fixed multiple 'node' variables by adding proper TypeScript types
########################################################3
Still to fix:
1. Components:
   - news/[id]/page.tsx: 'error'
   - news/page.tsx: 'motion'
   - repos/[id]/page.tsx: 'GitBranch', 'Users', 'LineChart', 'PieChart', 'BarChart', 'ResponsiveContainer', 'CardDescription', 'Contributor', 'router'
   - community/ResourceList.tsx: 'Loader2'
   - dashboard/AchievementsList.tsx: 'CardHeader', 'CardTitle'
   - dashboard/AvatarUpload.tsx: 'useState', 'error'
   - repos/tabs/ActivityTab.tsx: 'GitCommit'
   - ui/interactive-grid.tsx: 'motion'
   - ui/use-toast.ts: 'actionTypes'

2. Library Files:
   - github.ts: 'GitHubRepo', 'fetchPinnedRepos', 'fetchContributionStats' and their parameters

# Resolution Steps

1. Fix remaining Next.js Image Optimization Warnings:
   - Replace remaining `<img>` elements with Next.js `<Image>` component in:
     - events/[id]/page.tsx
     - news/[id]/page.tsx
     - repos/[id]/page.tsx

2. Clean up remaining unused imports and variables:
   - Remove all identified unused imports
   - Remove or properly utilize declared variables
   - Clean up unused types and functions in library files

3. Ensure all components maintain their current functionality while implementing these fixes

Note: All changes will be made systematically while preserving the existing functionality. The ✅ marks indicate completed fixes.
