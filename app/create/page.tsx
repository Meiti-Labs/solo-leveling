"use client";
import CreateQuestForm from "@/components/page-components/create/create-quest-form";
import DialogButton from "@/components/shared/dialoge-button";
import Box from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import * as React from "react";

export default function Create() {
  return (
    <div>
      <Box className="p-3 bg-[#BE99FE]/20 flex justify-between items-center">
        Create quest{" "}
        <DialogButton title="create quest">
          {({ setOpen }) => <CreateQuestForm setOpen={setOpen} />}
        </DialogButton>
      </Box>
    </div>
  );
}
