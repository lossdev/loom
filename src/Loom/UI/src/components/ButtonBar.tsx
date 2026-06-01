import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Spinner
} from "@shadcn/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired, faPlus, faTools, faWandMagicSparkles, faCopy, faCheck, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import type { AddTarget, Compose } from "@/types";

interface ButtonBarProps {
  compose: Compose;
  isEmpty: boolean;
  isDropdownOpen: boolean;
  setDropdownOpen: (isOpen: boolean) => void;
  setAddTarget: (target: AddTarget) => void;
  setSheetOpen: (isSheetOpen: boolean) => void;
}

export const ButtonBar = ({ compose, isEmpty, isDropdownOpen, setDropdownOpen, setAddTarget, setSheetOpen }: ButtonBarProps) => {
  const [composeFile, setComposeFile] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(composeFile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const blob = new Blob([composeFile], { type: 'application/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const generateCompose = async (compose: Compose) => {
    const response = await fetch('/api/compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compose),
    });

    if (!response.ok) throw new Error(`Failed to generate compose: ${response.status}`);
    setComposeFile(await response.text());
  };
  
  return (
    <React.Fragment>
      <div className="flex flex-row-reverse items-center">
        <div className="mr-16">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
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
        { !isEmpty &&
          <Dialog onOpenChange={(open) => {
            if (open) generateCompose(compose);
            if (!open) { setCopied(false); setComposeFile(""); }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline"
                      size="lg"
                      className="rounded-full dark:bg-logo-dark dark:hover:bg-button-bg-dark-hover dark:hover:text-text-dark dark:text-accent mr-4">
                Generate
                <FontAwesomeIcon icon={faWandMagicSparkles} className="ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-sm max-h-3/5 max-w-1/3">
              <DialogHeader>
                <DialogTitle className="mb-4">Your docker-compose.yml</DialogTitle>
                <DialogDescription>
                  Preview and export your docker-compose.yml here.
                </DialogDescription>
              </DialogHeader>
              <div className="relative mb-2 p-2 bg-input rounded-md overflow-y-auto max-h-72 min-h-16 border-3 border-accent">
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  { composeFile !== "" && <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> }
                </button>
                <pre className="pr-6">{
                  composeFile !== ""
                    ? composeFile : 
                    <div className="flex flex-row"><Spinner className="mr-4" />Loading...</div> 
                  }
                </pre>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSave}><FontAwesomeIcon icon={faFloppyDisk} className="mr-1"/>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      </div>
    </React.Fragment>
  );
}