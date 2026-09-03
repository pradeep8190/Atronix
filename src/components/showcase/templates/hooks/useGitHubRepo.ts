import { useState, useEffect, useCallback, useRef } from 'react';
import type { GitHubTreeItem, FileTreeNode } from '../types';

interface UseGitHubRepoResult {
  tree: FileTreeNode[];
  selectedPath: string;
  selectedCode: string;
  isLoadingTree: boolean;
  isLoadingFile: boolean;
  error: string | null;
  selectFile: (path: string) => void;
  refetch: () => void;
}

// Convert flat GitHub tree paths into a nested hierarchy
function buildNestedTree(items: GitHubTreeItem[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const map: Record<string, FileTreeNode> = {};

  // Sort items: folders first, then files alphabetically
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLeaf = i === parts.length - 1;
      const isFolder = !isLeaf || item.type === 'tree';
      const prevPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map[currentPath]) {
        const node: FileTreeNode = {
          name: part,
          path: currentPath,
          type: isFolder ? 'folder' : 'file',
          size: isLeaf ? item.size : undefined,
          children: isFolder ? [] : undefined,
        };

        map[currentPath] = node;

        if (i === 0) {
          root.push(node);
        } else if (map[prevPath] && map[prevPath].children) {
          map[prevPath].children!.push(node);
        }
      }
    }
  }

  // Sort children inside all folders: folders first, then files
  const sortChildren = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) {
        sortChildren(node.children);
      }
    }
  };

  sortChildren(root);
  return root;
}

export function useGitHubRepo(
  owner: string,
  repo: string,
  branch = 'main'
): UseGitHubRepoResult {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(true);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory cache for fetched raw files
  const cacheRef = useRef<Map<string, string>>(new Map());

  const getHeaders = useCallback((): HeadersInit => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);

  // Fetch full recursive file tree from GitHub API
  const fetchTree = useCallback(async () => {
    setIsLoadingTree(true);
    setError(null);

    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const res = await fetch(url, { headers: getHeaders() });

      if (!res.ok) {
        throw new Error(`GitHub API returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawTree: GitHubTreeItem[] = data.tree || [];
      const nested = buildNestedTree(rawTree);
      setTree(nested);

      // Pick a smart default file to display
      const priorityFiles = [
        'src/App.tsx',
        'src/App.jsx',
        'src/main.tsx',
        'package.json',
        'README.md',
      ];
      let initialFile = rawTree.find((item) => priorityFiles.includes(item.path))?.path;
      if (!initialFile) {
        const firstBlob = rawTree.find((item) => item.type === 'blob');
        initialFile = firstBlob ? firstBlob.path : '';
      }

      if (initialFile) {
        setSelectedPath(initialFile);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch repository tree';
      setError(message);
    } finally {
      setIsLoadingTree(false);
    }
  }, [owner, repo, branch, getHeaders]);

  // Fetch raw file content on demand with in-memory caching
  const fetchFileContent = useCallback(
    async (path: string) => {
      if (!path) return;

      if (cacheRef.current.has(path)) {
        setSelectedCode(cacheRef.current.get(path)!);
        return;
      }

      setIsLoadingFile(true);
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        const res = await fetch(rawUrl);

        if (!res.ok) {
          throw new Error(`Failed to load file (${res.status})`);
        }

        const text = await res.text();
        cacheRef.current.set(path, text);
        setSelectedCode(text);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load file content';
        setSelectedCode(`// Error: ${message}\n// Could not stream ${path} from GitHub`);
      } finally {
        setIsLoadingFile(false);
      }
    },
    [owner, repo, branch]
  );

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    if (selectedPath) {
      fetchFileContent(selectedPath);
    }
  }, [selectedPath, fetchFileContent]);

  const selectFile = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  return {
    tree,
    selectedPath,
    selectedCode,
    isLoadingTree,
    isLoadingFile,
    error,
    selectFile,
    refetch: fetchTree,
  };
}
