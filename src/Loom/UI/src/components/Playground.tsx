import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faNetworkWired, faTools } from "@fortawesome/free-solid-svg-icons";
import { faDocker} from "@fortawesome/free-brands-svg-icons";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@shadcn/components/ui";
import { 
  ContainerForm,
  ContainerNode,
  NetworkForm,
  NetworkNode
} from "@/components";
import type { Compose, Container, Network } from "@/types";


export const Playground = () => {
  type AddTarget =
    | { type: 'network' }
    | { type: 'container' }
    | { type: 'networkContainer'; networkId: string };
  
  const [compose, setCompose] = useState<Compose>({});
  const [draftNetwork, setDraftNetwork] = useState<Partial<Network>>({});
  const [draftContainer, setDraftContainer] = useState<Partial<Container>>({});
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const addNetwork = (network: Network) => {
    setCompose(prev => ({
      ...prev,
      networks: [...(prev.networks ?? []), network],
    }));
  };

  const addContainer = (container: Container) => {
    setCompose(prev => ({
      ...prev,
      containers: [...(prev.containers ?? []), container],
    }));
  };

  const addNetworkContainer = (networkId: string, container: Container) => {
    setCompose(prev => ({
      ...prev,
      networks: prev.networks?.map(n =>
        n.id === networkId
          ? { ...n, containers: [...n.containers, container] }
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
      <div className="flex flex-row-reverse items-center">
        <div className="mr-16">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"
                      size="icon-lg"
                      className="rounded-full dark:bg-button-bg-dark dark:hover:bg-button-bg-dark-hover dark:text-text-dark">
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <span><DropdownMenuLabel>Add a ..</DropdownMenuLabel></span>
                <span><DropdownMenuItem
                  onSelect={e => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setAddTarget({ type: 'network' });
                  setSheetOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faNetworkWired} />Network</DropdownMenuItem></span>
                <span><DropdownMenuItem
                  onSelect={e => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setAddTarget({ type: 'container' });
                    setSheetOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faDocker} />Container</DropdownMenuItem></span>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <span><DropdownMenuLabel>Configuration</DropdownMenuLabel></span>
                <span><DropdownMenuItem><FontAwesomeIcon icon={faTools} />Secrets, Volumes, and Configs</DropdownMenuItem></span>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex justify-center content-center items-center h-full w-full">
        <div className="flex flex-row h-90pct w-90pct dark:bg-playground-dark rounded-lg border-3 border-solid shadow-xl">
          {
            isEmpty ? (
            <div className="flex flex-row-reverse w-full h-10 mr-10 mt-10 animate-bounce-delayed">
              <img alt="Decorative arrow" src="/swoop-arrow.svg" className="ml-6 h-12" aria-hidden="true" />
              <span className="text-text-dark logo-font text-3xl translate-y-2">Add something to begin</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {compose.containers?.map(container => (
                <ContainerNode
                  key={container.id}
                  container={container}
                  onRemove={removeContainer}
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
                >
                  {network.containers.map(container => (
                    <ContainerNode
                      key={container.id}
                      container={container}
                      onRemove={id => removeNetworkContainer(network.id, id)}
                    />
                  ))}
                </NetworkNode>
              ))}
            </div>
          )}
        </div>
      </div>
      <Sheet open={sheetOpen} onOpenChange={open => {
        setSheetOpen(open);
        if (!open) {
          setDraftNetwork({});
          setDraftContainer({});
        }
      }}>
        <SheetContent>
          <form onSubmit={e => {
            e.preventDefault();
            if (addTarget?.type === 'network') {
              addNetwork({
                id: crypto.randomUUID(),
                containers: [],
                ...draftNetwork,
              } as Network);
            }
            if (addTarget?.type === 'container') {
              addContainer({
                id: crypto.randomUUID(),
                ...draftContainer,
              } as Container);
            }
            if (addTarget?.type === 'networkContainer') {
              addNetworkContainer(addTarget.networkId, {
                id: crypto.randomUUID(),
                ...draftContainer,
              } as Container);
            }
            setDraftNetwork({});
            setDraftContainer({});
            setSheetOpen(false);
          }}>
            <SheetHeader>
              <SheetTitle>
                {addTarget?.type === 'network' && 'Add Network'}
                {addTarget?.type === 'container' && 'Add Container'}
                {addTarget?.type === 'networkContainer' && 'Add Container to Network'}
              </SheetTitle>
              <SheetDescription>
                Add a new&nbsp;
                {addTarget?.type === 'network' ? 'Network' : 'Container'}
                &nbsp;configuration below.
              </SheetDescription>
            </SheetHeader>
            {addTarget?.type === 'network' ?
              <NetworkForm value={draftNetwork} onChange={setDraftNetwork} />
              :
              <ContainerForm value={draftContainer} onChange={setDraftContainer} />}
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline" type="button">Close</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}