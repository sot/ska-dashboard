export interface PullRequest {
  last_commit_date: string
  n_commits: number,
  number: number,
  title: string,
  url: string,
}

export interface Merge {
  author: string,
  branch: string,
  pr_number: number,
  title: string,
}

export interface Package {
  name: string,
  owner: string,
  updated_at: string
  master_version: string,
  flight: string,
  matlab: string,
  test_version: string,
  pull_requests: PullRequest[],
  merge_info: Merge[],
  n_pull_requests: number,
  merges: number,
  branches: number,
  issues: number,
  commits: number,
  pull_requests_item: any,
  merge_item: any,
  release_info: any,
  version: string,
}
