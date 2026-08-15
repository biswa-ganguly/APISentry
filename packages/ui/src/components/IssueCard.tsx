import React from 'react';
import { ContractIssue } from '@apisentry/types';

export interface IssueCardProps {
  issue: ContractIssue;
  onOpenFile?: (filePath: string, line: number, column: number) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onOpenFile }) => {
  const loc = issue.primaryLocation;
  const rel = issue.relatedLocations && issue.relatedLocations.length > 0 ? issue.relatedLocations[0] : null;

  let errorDetail = '';
  let expectedDetail = '';
  let solutionCode = '';

  if (issue.type === 'MISSING_REQUEST_FIELD') {
    const fieldMatch = issue.message.match(/field "([^"]+)"/);
    const fieldName = fieldMatch ? fieldMatch[1] : 'field';

    const sentSchema: Record<string, string> = {};
    if (issue.consumer?.request?.body) {
      issue.consumer.request.body.forEach(f => { sentSchema[f.name] = f.type || 'string'; });
    }

    const expectedSchema: Record<string, string> = {};
    if (issue.provider?.request?.body) {
      issue.provider.request.body.forEach(f => { expectedSchema[f.name] = f.type || 'string'; });
    } else {
      expectedSchema[fieldName] = 'string';
    }

    errorDetail = `// Current Frontend Payload (Missing: "${fieldName}")\n{\n` +
      Object.keys(sentSchema).map(k => `  "${k}": "${sentSchema[k]}"`).join(',\n') +
      `\n  // ❌ Missing required property: "${fieldName}"\n}`;

    expectedDetail = `// Correct Backend Route Schema\n{\n` +
      Object.keys(expectedSchema).map(k => `  "${k}": "${expectedSchema[k]}"${k === fieldName ? '  <-- REQUIRED' : ''}`).join(',\n') +
      `\n}`;

    solutionCode = `// Updated Frontend API Request Body Fix:\naxios.post("${issue.consumer?.path || '/api/register'}", {\n` +
      Object.keys(expectedSchema).map(k => `  ${k}: ${k === fieldName ? `/* Add ${fieldName} */ ""` : k}`).join(',\n') +
      `\n});`;
  } else if (issue.type === 'UNKNOWN_REQUEST_FIELD') {
    const fieldMatch = issue.message.match(/field "([^"]+)"/);
    const fieldName = fieldMatch ? fieldMatch[1] : 'field';

    const sentSchema: Record<string, string> = {};
    if (issue.consumer?.request?.body) {
      issue.consumer.request.body.forEach(f => { sentSchema[f.name] = f.type || 'string'; });
    }

    const expectedSchema: Record<string, string> = {};
    if (issue.provider?.request?.body) {
      issue.provider.request.body.forEach(f => { expectedSchema[f.name] = f.type || 'string'; });
    }

    errorDetail = `// Current Sent Payload\n{\n` +
      Object.keys(sentSchema).map(k => `  "${k}": "${sentSchema[k]}"${k === fieldName ? '  <-- ❌ UNKNOWN FIELD' : ''}`).join(',\n') +
      `\n}`;

    expectedDetail = `// Backend Zod Schema Validator\n{\n` +
      Object.keys(expectedSchema).map(k => `  "${k}": "${expectedSchema[k]}"`).join(',\n') +
      `\n}`;

    solutionCode = `// Corrected Payload (Remove "${fieldName}" or add to backend schema):\nconst requestBody = {\n` +
      Object.keys(sentSchema).filter(k => k !== fieldName).map(k => `  ${k}: ${k}`).join(',\n') +
      `\n};`;
  } else if (issue.type === 'METHOD_MISMATCH') {
    errorDetail = `// Frontend call verb:\nHTTP ${issue.consumer?.method || 'POST'} ${issue.consumer?.path || ''}`;
    expectedDetail = `// Backend route verb:\nHTTP ${issue.provider?.method || 'PUT'} ${issue.provider?.path || ''}`;
    solutionCode = `// Correct HTTP verb in frontend call:\nawait axios.${(issue.provider?.method || 'PUT').toLowerCase()}("${issue.consumer?.path || '/api'}");`;
  } else if (issue.type === 'ENDPOINT_NOT_FOUND') {
    errorDetail = `// Unmatched Call:\nHTTP ${issue.consumer?.method} ${issue.consumer?.path}`;
    expectedDetail = `// Expected Handler:\nNo Express route matching "${issue.consumer?.path}"`;
    solutionCode = `// Express Router Fix (Add endpoint in backend):\napp.${(issue.consumer?.method || 'GET').toLowerCase()}("${issue.consumer?.path}", (req, res) => {\n  res.json({ success: true });\n});`;
  } else {
    errorDetail = issue.message;
    expectedDetail = 'Backend contract schema';
    solutionCode = '// Align frontend request payload with backend schema definition.';
  }

  const getFileName = (fullPath: string) => fullPath.split(/[\/\\]/).pop() || fullPath;

  return (
    <div className={`bg-gray-900/90 border border-white/10 rounded-xl p-5 flex flex-col gap-4 border-l-4 ${issue.severity === 'error' ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
      <div className="flex items-center justify-between">
        <span className={`font-mono font-extrabold text-xs px-2.5 py-1 rounded-md ${issue.severity === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
          [{issue.type}] {issue.consumer ? `${issue.consumer.method} ${issue.consumer.path}` : ''}
        </span>
      </div>

      <p className="text-sm font-semibold leading-relaxed text-gray-100">{issue.message}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Error Box */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col gap-2 border-l-2 border-l-rose-500">
          <div className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider">
            ❌ Current Sent Payload (Frontend)
          </div>
          <pre className="font-mono text-xs bg-black/50 p-3 rounded-md text-gray-300 border border-white/5 whitespace-pre-wrap break-all">
            {errorDetail}
          </pre>
          <button
            onClick={() => onOpenFile && onOpenFile(loc.filePath, loc.startLine, loc.startColumn)}
            className="font-mono text-xs text-sky-400 hover:underline text-left mt-1"
          >
            📍 {getFileName(loc.filePath)}:{loc.startLine}:{loc.startColumn}
          </button>
        </div>

        {/* Expected Box */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col gap-2 border-l-2 border-l-emerald-500">
          <div className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
            ✅ Correct Expected Schema (Backend)
          </div>
          <pre className="font-mono text-xs bg-black/50 p-3 rounded-md text-gray-300 border border-white/5 whitespace-pre-wrap break-all">
            {expectedDetail}
          </pre>
          {rel ? (
            <button
              onClick={() => onOpenFile && onOpenFile(rel.filePath, rel.startLine, rel.startColumn)}
              className="font-mono text-xs text-sky-400 hover:underline text-left mt-1"
            >
              🔗 {getFileName(rel.filePath)}:{rel.startLine}:{rel.startColumn}
            </button>
          ) : (
            <span className="text-xs text-gray-500 mt-1">No provider file</span>
          )}
        </div>
      </div>

      {/* Suggested Fix Box */}
      <div className="bg-cyan-500/10 border border-cyan-500/35 rounded-lg p-4 flex flex-col gap-2">
        <div className="font-extrabold text-cyan-400 text-sm">💡 Suggested Code Fix & Patch:</div>
        <pre className="font-mono text-xs bg-black/40 p-3 rounded-md text-emerald-200 border border-emerald-500/20 whitespace-pre-wrap break-all">
          {solutionCode}
        </pre>
      </div>
    </div>
  );
};
