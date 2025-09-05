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
import { PiconRight } from "../icons/icons";

interface IDialogButtonProps {
  buttonProps?: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    };
  title: string;
  buttonIcon?: React.JSX.Element;
  description?: string;
  dialogeClassName?: string;
  children: ({
    open,
    setOpen,
  }: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}

const DialogButton: React.FunctionComponent<IDialogButtonProps> = ({
  buttonProps = {},
  title,
  description,
  children,
  buttonIcon = <PiconRight />,
  dialogeClassName = "",
}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpenDialog = () => {
    setOpen(true);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        {...buttonProps}
        size={"icon"}
        className={"bg-transparent text-white" + buttonProps.className}
        onClick={handleOpenDialog}
      >
        {buttonIcon}
      </Button>
      <DialogContent
        className={"max-h-[90vh]  w-full overflow-x-hidden " + dialogeClassName}
      >
        <DialogHeader>
          <DialogTitle className="border  text-centerfont-normal text-shadow-lg text-shadow-pink-200 border-pink-100/30 w-fit  mx-auto p-3 px-4">
            {title}
          </DialogTitle>
          <DialogDescription className="my-5 text-center text-white text-shadow-white/75 text-shadow-xs font-semibold">
            {description}
          </DialogDescription>
          <div>{children({ open, setOpen })}</div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DialogButton;
