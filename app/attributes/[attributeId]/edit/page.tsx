"use client";

import { useParams } from "next/navigation";
import AttributeFormScreen from "@/components/attribute-form-screen";

export default function EditAttributePage() {
  const params = useParams<{ attributeId: string }>();

  return <AttributeFormScreen attributeId={params.attributeId} />;
}
