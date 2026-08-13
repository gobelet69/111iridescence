import process from 'node:process';
import { synchronizeGitHub } from './sync-github-projects.mjs';

if (process.env.SKIP_GITHUB_SYNC === '1') {
  console.log('Using the GitHub data already synchronized for this run.');
} else {
  const result = await synchronizeGitHub({ token: process.env.GITHUB_TOKEN });
  const changed = [result.repositoriesChanged && 'repositories', result.contributionsChanged && 'contributions']
    .filter(Boolean)
    .join(' and ');
  console.log(changed ? `Synchronized GitHub ${changed}.` : 'GitHub data is already current.');
}
