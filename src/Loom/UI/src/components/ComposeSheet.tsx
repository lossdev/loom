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
  onAddNetwork: (network: Network) => void;
  onAddContainer: (container: Container) => void;
  onAddNetworkContainer: (networkId: string, container: Container) => void;
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
    }
  };
  
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (addTarget?.type === 'network') {
      onAddNetwork({ id: crypto.randomUUID(), containers: [], driver: draftNetwork.driver || 'bridge', ...draftNetwork } as Network);
    }
    if (addTarget?.type === 'network-edit') {
      onUpdateNetwork({ ...addTarget.network, ...draftNetwork } as Network);
    }
    if (addTarget?.type === 'container') {
      onAddContainer({ id: crypto.randomUUID(), ...draftContainer } as Container);
    }
    if (addTarget?.type === 'container-edit') {
      onUpdateContainer({ ...addTarget.container, ...draftContainer } as Container);
    }
    if (addTarget?.type === 'networkContainer') {
      onAddNetworkContainer(addTarget.networkId, { id: crypto.randomUUID(), ...draftContainer } as Container);
    }
    if (addTarget?.type === 'networkContainer-edit') {
      onUpdateNetworkContainer(addTarget.networkId, { ...addTarget.container, ...draftContainer } as Container);
    }
    onDraftNetworkChange({});
    onDraftContainerChange({});
    onOpenChange(false);
  };

  const isEdit = addTarget?.type.includes('edit');
  const isNetwork = addTarget?.type === 'network' || addTarget?.type === 'network-edit';
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    setFormValid(addTarget?.type.includes('edit') ?? false);
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
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{title()}</SheetTitle>
            <SheetDescription>
              {isEdit ? 'Edit the' : 'Add a new'}&nbsp;
              {isNetwork ? 'Network' : 'Container'}&nbsp;configuration below.
            </SheetDescription>
          </SheetHeader>
          {isNetwork
            ? <NetworkForm value={draftNetwork} onChange={onDraftNetworkChange} takenNames={takenNetworkNames} onValidityChange={setFormValid} />
            : <ContainerForm value={draftContainer} onChange={onDraftContainerChange} takenNames={takenContainerNames} onValidityChange={setFormValid} />}
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