export function isSidebarLinkActive(route: string, pathname: string, searchParams: Pick<URLSearchParams, 'get'>, routes: string[]) {
  if (pathname === '/dashboard/questionnaire') return route === '/dashboard/bookings?view=questionnaires';
  const [routePath, query = ''] = route.split('?');
  const matchesPath = pathname === routePath || (routePath !== '/dashboard' && routePath.length > 1 && pathname.startsWith(`${routePath}/`));
  if (!matchesPath) return false;
  const matchesQuery = (value: string) => Array.from(new URLSearchParams(value)).every(([key, expected]) => searchParams.get(key) === expected);
  if (query) return matchesQuery(query);
  return !routes.some(candidate => {
    const [candidatePath, candidateQuery] = candidate.split('?');
    return candidatePath === routePath && Boolean(candidateQuery) && matchesQuery(candidateQuery);
  });
}