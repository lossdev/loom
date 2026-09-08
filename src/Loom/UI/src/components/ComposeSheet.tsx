import React, { useState, useEffect } from 'react';
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@shadcn/components/ui';
import type { AddTarget, Container, Network } from '@/types';
import { NetworkForm, ContainerForm } from '@/components';

interface ComposeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addTarget: AddTarget | null;
  draftNetwork: Partial<Network>;
  draftContainer: Partial<Container>;
  onDraftNetworkChange: (network: Partial<Network>) => void;
  onDraftContainerChange: (container: Partial<Container>) => void;
  onAddNetwork: (network: Network) => boolean;
  onAddContainer: (container: Container) => boolean;
  onAddNetworkContainer: (networkId: string, container: Container) => boolean;
  onUpdateNetwork: (network: Network) => void;
  onUpdateContainer: (container: Container) => void;
  onUpdateNetworkContainer: (networkId: string, container: Container) => void;
  takenNetworkNames: string[];
  takenContainerNames: string[];
}

export const ComposeSheet = ({
  open,
  onOpenChange,
  addTarget,
  draftNetwork,
  draftContainer,
  onDraftNetworkChange,
  onDraftContainerChange,
  onAddNetwork,
  onAddContainer,
  onAddNetworkContainer,
  onUpdateNetwork,
  onUpdateContainer,
  onUpdateNetworkContainer,
  takenNetworkNames,
  takenContainerNames,
}: ComposeSheetProps) => {

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      onDraftNetworkChange({});
      onDraftContainerChange({});
      setFormValid(false);
      setDuplicateNameError(undefined);
    }
  };

  const handleDraftNetworkChange = (network: Partial<Network>) => {
    setDuplicateNameError(undefined);
    onDraftNetworkChange(network);
  };

  const handleDraftContainerChange = (container: Partial<Container>) => {
    setDuplicateNameError(undefined);
    onDraftContainerChange(container);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    let added = true;
    if (addTarget?.type === 'network') {
      added = onAddNetwork({ id: crypto.randomUUID(), containers: [], driver: draftNetwork.driver || 'bridge', ...draftNetwork } as Network);
    }
    if (addTarget?.type === 'network-edit') {
      onUpdateNetwork({ ...addTarget.network, ...draftNetwork } as Network);
    }
    if (addTarget?.type === 'container') {
      added = onAddContainer({ id: crypto.randomUUID(), ...draftContainer } as Container);
    }
    if (addTarget?.type === 'container-edit') {
      onUpdateContainer({ ...addTarget.container, ...draftContainer } as Container);
    }
    if (addTarget?.type === 'networkContainer') {
      added = onAddNetworkContainer(addTarget.networkId, { id: crypto.randomUUID(), ...draftContainer } as Container);
    }
    if (addTarget?.type === 'networkContainer-edit') {
      onUpdateNetworkContainer(addTarget.networkId, { ...addTarget.container, ...draftContainer } as Container);
    }

    if (!added) {
      const name = isNetwork ? draftNetwork.name : draftContainer.name;
      setDuplicateNameError(`A ${isNetwork ? 'network' : 'container'} named "${name}" already exists.`);
      return;
    }

    onDraftNetworkChange({});
    onDraftContainerChange({});
    onOpenChange(false);
  };

  const isEdit = addTarget?.type.includes('edit');
  const isNetwork = addTarget?.type === 'network' || addTarget?.type === 'network-edit';
  const [formValid, setFormValid] = useState(false);
  const [duplicateNameError, setDuplicateNameError] = useState<string | undefined>(undefined);

  // Editing shouldn't trip the duplicate check against the entity's own (unchanged) name.
  const effectiveTakenNetworkNames = addTarget?.type === 'network-edit'
    ? takenNetworkNames.filter(name => name !== addTarget.network.name)
    : takenNetworkNames;

  const effectiveTakenContainerNames = addTarget?.type === 'container-edit' || addTarget?.type === 'networkContainer-edit'
    ? takenContainerNames.filter(name => name !== addTarget.container.name)
    : takenContainerNames;

  useEffect(() => {
    setFormValid(addTarget?.type.includes('edit') ?? false);
    setDuplicateNameError(undefined);
  }, [addTarget]);

  const title = () => {
    switch (addTarget?.type) {
      case 'network': return 'Add Network';
      case 'network-edit': return 'Edit Network';
      case 'container': return 'Add Container';
      case 'container-edit': return 'Edit Container';
      case 'networkContainer': return 'Add Container to Network';
      case 'networkContainer-edit': return 'Edit Container in Network';
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
          <SheetHeader>
            <SheetTitle>{title()}</SheetTitle>
            <SheetDescription>
              {isEdit ? 'Edit the' : 'Add a new'}&nbsp;
              {isNetwork ? 'Network' : 'Container'}&nbsp;configuration below.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {isNetwork
              ? <NetworkForm value={draftNetwork} onChange={handleDraftNetworkChange} takenNames={effectiveTakenNetworkNames} onValidityChange={setFormValid} error={duplicateNameError} />
              : <ContainerForm value={draftContainer} onChange={handleDraftContainerChange} takenNames={effectiveTakenContainerNames} onValidityChange={setFormValid} error={duplicateNameError} />}
          </div>
          <SheetFooter>
            <Button type="submit" disabled={!formValid}>{isEdit ? 'Save changes' : 'Add'}</Button>
            <SheetClose asChild>
              <Button variant="outline" type="button">Close</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};