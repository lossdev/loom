import React, { useState } from 'react';

import type { Network } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuTrigger
} from "@shadcn/components/ui/dropdown-menu.tsx";
import {Button} from "@shadcn/components/ui/button.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

export const Playground = () => {
  const [networks, _setNetworks] = useState<Network[]>([]);
  
  return (
    <React.Fragment>
      <div className="flex flex-row-reverse items-center">
        <div className="mr-16">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"
                      size="icon-lg"
                      className="rounded-full dark:bg-button-bg-dark dark:hover:bg-button-bg-dark-hover dark:text-text-dark">
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Add a ..</DropdownMenuLabel>
                <DropdownMenuItem>Network</DropdownMenuItem>
                <DropdownMenuItem>Container</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex justify-center content-center items-center h-full w-full">
        <div className="flex flex-row h-90pct w-90pct dark:bg-playground-dark rounded-lg border-3 border-solid shadow-xl">
          {
            networks.length === 0 ?
              <div className="flex flex-row-reverse w-full h-10 mr-10 mt-10 animate-bounce-delayed">
                <img alt="Decorative arrow" src="/swoop-arrow.svg" className="ml-6 h-12" aria-hidden="true" />
                <span className="text-text-dark logo-font text-3xl translate-y-2">Add something to begin</span>
              </div>
              :
              <div className="" />
          }
        </div>
      </div>
    </React.Fragment>
  )
}