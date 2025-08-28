"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "../ui/button";
import { VariantProps } from "class-variance-authority";
import { Icon } from "@iconify/react/dist/iconify.js";

interface IDialogButtonProps {
  buttonProps?: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    };
    title: string;
    description?: string;
    children: ({open,setOpen}: {open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>}) => React.ReactNode;
}

const DialogButton: React.FunctionComponent<IDialogButtonProps> = ({
  buttonProps = {},
  title,
  description,
  children
}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpenDialog = () => {
    setOpen(true);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button {...buttonProps} size={"icon"} className={"bg-transparent text-white" + buttonProps.className }onClick={handleOpenDialog}>
      <Icon icon="picon:right" />
      </Button>
      <DialogContent className="max-h-[90vh] w-full overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
           {description}
          </DialogDescription>
          <div>
            {children({open,setOpen})}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DialogButton;
