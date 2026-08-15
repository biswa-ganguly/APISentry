import { Project } from 'ts-morph';

export function createProject(filePaths?: string[]): Project {
  const project = new Project({
    compilerOptions: {
      allowJs: true,
      jsx: 2, // React JSX
      skipLibCheck: true
    },
    skipAddingFilesFromTsConfig: true
  });

  if (filePaths && filePaths.length > 0) {
    for (const filePath of filePaths) {
      try {
        project.addSourceFileAtPathIfExists(filePath);
      } catch (err) {
        console.warn(`[APISentry] Failed to load source file ${filePath}:`, err);
      }
    }
  }

  return project;
}
