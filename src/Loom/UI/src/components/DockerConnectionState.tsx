import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faCircle } from "@fortawesome/free-solid-svg-icons";

import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/components/ui';
import { describeRequestError, describeResponseError } from "@/lib";

// Mirrors DockerConnectionStatus on the server.
const connectionState = {
  Disabled: 'Disabled',
  NotFound: 'NotFound',
  Connected: 'Connected',
  Error: 'Error',
} as const;

// The shape returned by both /localDocker/status and /localDocker/refresh.
interface DockerStatus {
  connected: boolean;
  status: string;
  version?: string | null;
  reason?: string | null;
}

const statusColors: Record<string, string> = {
  [connectionState.Connected]: 'text-status-green',
  [connectionState.Error]: 'text-status-red',
};

export const DockerConnectionState = () => {
  const [dockerState, setDockerState] = useState<string>(connectionState.NotFound);
  const [statusDetail, setStatusDetail] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  // Derived rather than stored, so the dot can't drift out of sync with the label.
  const statusColor = statusColors[dockerState] ?? 'text-status-yellow';

  // Both endpoints answer with the same payload, so one loader covers the initial
  // read and the manual refresh. It resolves rather than throws, which is what lets
  // the callers below fire it without awaiting.
  const loadDockerState = async (endpoint: string, method: 'GET' | 'POST') => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        setDockerState(connectionState.Error);
        setStatusDetail(await describeResponseError(response));
        return;
      }

      const status: DockerStatus = await response.json();
      setDockerState(status.status);
      setStatusDetail(status.reason ?? null);
    } catch (err) {
      setDockerState(connectionState.Error);
      setStatusDetail(describeRequestError(err));
    }
  };

  const handleRefreshClick = () => {
    setSpinCount(count => count + 1);
    loadDockerState('/localDocker/refresh', 'POST');
  };

  // Reads the connection state once on mount; the refresh button drives it after that.
  useEffect(() => {
    (async () => {
      await loadDockerState('/localDocker/status', 'GET');
    })();
  }, []);

  const label = (
    <span className="text-text-dark text-sm">
      Docker connection: {dockerState === connectionState.NotFound ? 'Not Found' : dockerState}
    </span>
  );

  return(
    <React.Fragment>
      <div className="flex flex-row items-center w-full pl-12 pb-6">
        <FontAwesomeIcon icon={faCircle} className={`pr-2 ${statusColor}`} />
        { statusDetail !== null
          ? <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help underline decoration-dotted underline-offset-4">{label}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusDetail}</p>
              </TooltipContent>
            </Tooltip>
          : label }
        <FontAwesomeIcon
          key={spinCount}
          icon={faArrowRotateLeft}
          className={`pl-2 text-text-dark cursor-pointer ${spinCount > 0 ? 'animate-spin-once' : ''}`}
          onClick={handleRefreshClick}
        />
      </div>
    </React.Fragment>
  );
}
