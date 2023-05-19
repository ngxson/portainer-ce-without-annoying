const path = require('path');
const { spawn } = require('child_process');

const ACCEPTED_TAGS_FROM = '2.17.0';
const UPSTREAM_REPO = 'portainer/portainer-ce';
const OUTPUT_REPO = 'ngxson/portainer-ce-without-annoying';

function build_and_push(tag) {
  const cwd = path.join(__dirname, '..');
  const command = `TAG=${tag} ./scripts/build_and_push.sh`;

  return new Promise(resolve => {
    const subproc = spawn('/bin/sh', ['-c', command], { cwd });
    subproc.stdout.pipe(process.stdout);
    subproc.stderr.pipe(process.stderr);
    subproc.on('close', () => resolve());
  });
}


/////////////////////////////////////

/**
 * Prompt to ChatGPT: write js function that converts semver to int, for example 12.34.567 to 012034567. take into account case that input maybe 12.34 (output should be 012034000) or just 12 (output is 012000000)
 */

function semverToInt(semver) {
  const versionParts = semver.split('.');
  const paddedVersionParts = versionParts.map((part, index) => {
    const paddedPart = part.padStart(3, '0');
    return index < 2 ? paddedPart : paddedPart + '0'.repeat(6 - (versionParts.length - 1) * 3);
  });
  return parseInt(paddedVersionParts.join(''));
}

/////////////////////////////////////

/**
 * Prompt to ChatGPT: now, I have docker hub api to return a list of tags of a repo, it's in results[i].name (a semver string)
 * the api url is `https://hub.docker.com/v2/repositories/${repoName}/tags/`
 * write nodejs code using fetch (async - await) to:
 * 1. fetch name of all tags of repo_a and repo_b
 * 2. get a list of difference of tags between the 2 (for example, repo_a has tag 1, 2, 3 and repo_b has 1, 2 ==> difference of tags is the "3")
 * 3. for each difference of tags, call build_and_push(tag)
 */

// Utility function to fetch tags for a given repo
async function fetchTags(repoName) {
  const url = `https://hub.docker.com/v2/repositories/${repoName}/tags/?page_size=50&page=1`;
  const response = await fetch(url);
  return (await response.json())
    .results.map(result => result.name)
    .filter(t => t.match(/^(latest|[\d.]+)$/));
}

// Utility function to find the difference between two tag arrays
function findTagDifference(tagsA, tagsB) {
  return tagsA.filter(tag => !tagsB.includes(tag));
}

// Main function to fetch tags, find the difference, and call build_and_push
async function processRepos(repoA, repoB) {
  try {
    const tagsA = await fetchTags(repoA);
    const tagsB = await fetchTags(repoB);
    console.log({ tagsA, tagsB });

    const tagDifference = findTagDifference(tagsA, tagsB);

    // added by me
    const acceptTagsFrom = semverToInt(ACCEPTED_TAGS_FROM);
    const acceptedTags = tagDifference.filter(tag => semverToInt(tag) >= acceptTagsFrom);
    acceptedTags.sort((a, b) => semverToInt(a) - semverToInt(b));
    if (acceptedTags.length > 0) acceptedTags.push('latest');

    if (acceptedTags.length === 0) {
      console.log('No new tags to build, exit now');
      process.exit(0);
    }

    console.log('Tags to build:', acceptedTags);
    for (const tag of acceptedTags) {
      console.log(`============= Building ${tag} =============`);
      await build_and_push(tag);
      console.log(`=============   Done ${tag}   =============`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

processRepos(UPSTREAM_REPO, OUTPUT_REPO);
