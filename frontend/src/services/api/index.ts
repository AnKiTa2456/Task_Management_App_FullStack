/**
 * services/api/index.ts — barrel export
 *
 * WHY: Import from 'services/api' not 'services/api/tasks.api'.
 * Keeps imports short across the codebase.
 */
export { authApi }     from './auth.api';
export { boardsApi }   from './boards.api';
export { tasksApi }    from './tasks.api';
export { commentsApi } from './comments.api';
export { activityApi } from './activity.api';
export { teamsApi }    from './teams.api';
export { usersApi }    from './users.api';
