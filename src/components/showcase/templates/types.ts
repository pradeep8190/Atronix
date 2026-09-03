export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  children?: FileTreeNode[];
}

export interface AppShowcaseMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  owner: string;
  repo: string;
  branch: string;
  liveUrl: string;
  tags: string[];
  techStack: string[];
  stars?: number;
}
