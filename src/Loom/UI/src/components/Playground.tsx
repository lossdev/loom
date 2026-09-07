import React, { useState } from 'react';

import type {
  AddTarget,
  Compose,
  Container,
  Network
} from "@/types";
import {
  ButtonBar,
  ComposeSheet,
  ContainerNode,
  NetworkNode
} from "@/components";

const getContainerNames = (compose: Compose): string[] => [
  ...(compose.containers?.map(c => c.name) ?? []),
  ...(compose.networks?.flatMap(n => n.containers.map(c => c.name)) ?? [])
];

// TODO: Verify light theme colors
export const Playground = () => {
  const [compose, setCompose] = useState<Compose>({});
  const [draftNetwork, setDraftNetwork] = useState<Partial<Network>>({});
  const [draftContainer, setDraftContainer] = useState<Partial<Container>>({});
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const addNetwork = (network: Network): boolean => {
    if (compose.networks?.some(n => n.name === network.name)) {
      return false;
    }
    setCompose(prev => ({
      ...prev,
      networks: [...(prev.networks ?? []), network],
    }));
    return true;
  };

  const addContainer = (container: Container): boolean => {
    if (getContainerNames(compose).includes(container.name)) {
      return false;
    }
    setCompose(prev => ({
      ...prev,
      containers: [...(prev.containers ?? []), container],
    }));
    return true;
  };

  const addNetworkContainer = (networkId: string, container: Container): boolean => {
    if (getContainerNames(compose).includes(container.name)) {
      return false;
    }
    setCompose(prev => ({
      ...prev,
      networks: prev.networks?.map(n =>
        n.id === networkId
          ? { ...n, containers: [...n.containers, container] }
          : n
      ),
    }));
    return true;
  };
  
  const updateContainer = (container: Container) => {
    setCompose(prev => ({
      ...prev,
      containers: prev.containers?.map(c => c.id === container.id ? container : c),
    }))
  }

  const updateNetwork = (network: Network) => {
    setCompose(prev => ({
      ...prev,
      networks: prev.networks?.map(n => n.id === network.id ? network : n),
    }));
  };

  const updateNetworkContainer = (networkId: string, container: Container) => {
    setCompose(prev => ({
      ...prev,
      networks: prev.networks?.map(n =>
        n.id === networkId
          ? { ...n, containers: n.containers.map(c => c.id === container.id ? container : c) }
          : n
      ),
    }));
  };

  const removeNetwork = (id: string) => {
    setCompose(prev => ({
      ...prev,
      networks: prev.networks?.filter(n => n.id !== id),
    }));
  };

  const removeContainer = (id: string) => {
    setCompose(prev => ({
      ...prev,
      containers: prev.containers?.filter(c => c.id !== id),
    }));
  };

  const removeNetworkContainer = (networkId: string, containerId: string) => {
    setCompose(prev => ({
      ...prev,
      networks: prev.networks?.map(n =>
        n.id === networkId
          ? { ...n, containers: n.containers.filter(c => c.id !== containerId) }
          : n
      ),
    }));
  };

  const isEmpty = !compose.containers?.length && !compose.networks?.length;

  return (
    <React.Fragment>
      <ButtonBar
        compose={compose}
        isEmpty={isEmpty}
        isDropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setAddTarget={setAddTarget}
        setSheetOpen={setSheetOpen}
      />
      <div className="flex justify-center content-center items-center h-full w-full overflow-hidden">
        <div className="h-90pct w-90pct dark:bg-playground-dark rounded-lg border-3 border-solid shadow-xl overflow-auto">
          {isEmpty ? (
            <div className="flex flex-row-reverse w-full h-10 mr-10 mt-10 animate-bounce-delayed">
              <img alt="Decorative arrow" src="/swoop-arrow.svg" className="ml-6 mr-3 h-12" aria-hidden="true" />
              <span className="text-text-dark logo-font text-3xl translate-y-2">Add something to begin</span>
            </div>
          ) : (
            <div className="flex flex-row flex-wrap items-start content-start gap-4 p-4">
              {compose.containers?.map(container => (
                <ContainerNode
                  key={container.id}
                  container={container}
                  onRemove={removeContainer}
                  onClick={container => {
                    setAddTarget({ type: 'container-edit', container });
                    setDraftContainer(container);
                    setSheetOpen(true);
                  }}
                />
              ))}
              {compose.networks?.map((network, index) => (
                <NetworkNode
                  key={network.id}
                  network={network}
                  index={index}
                  onRemove={removeNetwork}
                  onAddContainer={() => {
                    setAddTarget({ type: 'networkContainer', networkId: network.id });
                    setSheetOpen(true);
                  }}
                  onClick={network => {
                    setAddTarget({ type: 'network-edit', network });
                    setDraftNetwork(network);
                    setSheetOpen(true);
                  }}
                >
                  {network.containers.map(container => (
                    <ContainerNode
                      key={container.id}
                      container={container}
                      onRemove={id => removeNetworkContainer(network.id, id)}
                      onClick={container => {
                        setAddTarget({ type: 'networkContainer-edit', networkId: network.id, container });
                        setDraftContainer(container);
                        setSheetOpen(true);
                      }}
                    />
                  ))}
                </NetworkNode>
              ))}
            </div>
          )}
        </div>
      </div>
      <ComposeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        addTarget={addTarget}
        draftNetwork={draftNetwork}
        draftContainer={draftContainer}
        onDraftNetworkChange={setDraftNetwork}
        onDraftContainerChange={setDraftContainer}
        onAddNetwork={addNetwork}
        onAddContainer={addContainer}
        onAddNetworkContainer={addNetworkContainer}
        onUpdateNetwork={updateNetwork}
        onUpdateContainer={updateContainer}
        onUpdateNetworkContainer={updateNetworkContainer}
        takenNetworkNames={compose.networks?.map(n => n.name) ?? []}
        takenContainerNames={getContainerNames(compose)}
      />
    </React.Fragment>
  );
}