type ParsedStreamName = {
  streamName: string;
  projectName: string | null;
};

export function parseStreamName(fullName: string): ParsedStreamName {
  const slashIdx = fullName.indexOf("/");
  const projectName = slashIdx !== -1 ? fullName.slice(0, slashIdx) : null;
  const raw = slashIdx !== -1 ? fullName.slice(slashIdx + 1) : fullName;
  const streamName = raw.replace(/-[A-Za-z0-9]{6,}$/, "");
  return { streamName, projectName };
}
