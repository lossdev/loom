import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faCircle } from "@fortawesome/free-solid-svg-icons";

export const DockerConnectionState = () => {

  // @ts-expect-error a const enum is not erasable syntax, which this project enforces
  const enum connectionState {
    Disabled = 'Disabled',
    NotFound = 'NotFound',
    Connected = 'Connected',
    Error = 'Error',
  }

  const [dockerState, setDockerState] = useState<string>(connectionState.NotFound);
  const [statusColor, setStatusColor] = useState<string>('');
  const [spinCount, setSpinCount] = useState(0);

  const getDockerConnectionState = async() => {
    await fetch('/localDocker/status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(resp => {
        setDockerState(resp.status);
        updateStatusColor(resp.status);
      });
  };
  
  const updateDockerConnectionState = async() => {
    await fetch('/localDocker/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(resp => {
        setDockerState(resp.status);
        updateStatusColor(resp.status);
      })
  }
  
  const handleRefreshClick = () => {
    setSpinCount(count => count + 1);
    updateDockerConnectionState();
  };

  const updateStatusColor = (status: string) => {
    switch(status) {
      case 'Connected':
        setStatusColor('text-status-green');
        break;
      case 'Error':
        setStatusColor('text-status-red');
        break;
      default:
        setStatusColor('text-status-yellow');
        break;
    }
  }

  // Deliberately runs once on mount; the fetch helper is redefined every render,
  // so listing it as a dependency would re-run this on every render.
  useEffect(() => {
    (async () => {
      await getDockerConnectionState();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return(
    <React.Fragment>
      <div className="flex flex-row items-center w-full pl-12 pb-6">
        <FontAwesomeIcon icon={faCircle} className={`pr-2 ${statusColor}`} />
        <span className="text-text-dark text-sm">Docker connection: {dockerState == 'NotFound' ? 'Not Found' : dockerState}</span>
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