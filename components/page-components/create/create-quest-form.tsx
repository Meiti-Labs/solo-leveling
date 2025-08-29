import * as React from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  FieldErrors,
} from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CardContent from "@mui/material/CardContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ApiService from "@/utils/ApiService";
import { userStore } from "@/store/userStore";
import { DatePicker } from "@/components/ui/date-picker";
import { questSchema } from "@/schemas/questSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// 2️⃣ Infer types
type QuestFormValues = z.infer<typeof questSchema>;

interface ICreateQuestFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateQuestForm: React.FC<ICreateQuestFormProps> = ({ setOpen }) => {
  const { user } = userStore();
  const [hasAchievment, setHasAchievement] = React.useState(false);
  const { control, handleSubmit, formState, watch, resetField } = useForm({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: "",
      description: "",
      isDaily: false,
      deadline: "",
      achievement: undefined,
      tasks: [{ title: "", description: "", category: "mind", uuid: uuidv4() }],
      userTelegramId: user?.telegramId,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const onSubmit = (data: QuestFormValues) => {
    ApiService.post("/secure/quest/create", {
      ...data,
      userTelegramId: user?.telegramId,
    }).then((res) => {
      if (res.resultCode == "Ok") {
        setOpen(false);
      }
    });
  };

  const onError = (errors: FieldErrors<QuestFormValues>) => {
    if (errors.achievement) {
      toast.error("Fill achievment fields or close it.");
      return;
    }

    if (errors.tasks) {
      toast.error("Fill Tasks fields or remove it.");
      return;
    }

    const first = Object.values(errors)[0]?.message?.toString() ?? "";
    toast.error(first);
  };
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field }) => <Input {...field} placeholder="Quest Title" />}
      />
      {errors.title && (
        <span className="text-red-500 text-xs">{errors.title.message}</span>
      )}

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Textarea {...field} placeholder="Description" />
        )}
      />

      {/* Is Daily */}
      <Controller
        control={control}
        name="isDaily"
        render={({ field }) => (
          <div className="flex items-center gap-3 my-10">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="text-white"
            />
            Daily Quest?
          </div>
        )}
      />

      {/* Deadline */}
      <Controller
        control={control}
        name="deadline"
        render={({ field }) => (
          <Card>
            <CardHeader>
              <CardTitle>DeadLine</CardTitle>
              <CardDescription>
                Set the date by which this quest must be completed. Missing the
                deadline will result in XP loss and may affect your progress, so
                plan carefully!
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-hidden">
              <DatePicker
                {...field}
                value={field.value ? new Date(field.value) : null}
                onChange={(date) =>
                  field.onChange(date ? date.toISOString() : null)
                }
                disabled={watch("isDaily")}
              />
            </CardContent>
          </Card>
        )}
      />

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3 className="font-bold flex justify-between">
              Tasks{" "}
              <Button
                type="button"
                onClick={() =>
                  append({
                    title: "",
                    description: "",
                    category: "mind",
                    totalProgress: 1,
                    uuid: uuidv4(),
                  })
                }
              >
                ➕ Add Task
              </Button>
            </h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {fields.map((field, index) => (
            <div key={field.id} className="p-2  border rounded space-y-2">
              <Controller
                control={control}
                name={`tasks.${index}.title`}
                render={({ field }) => (
                  <Input {...field} placeholder="Task Title" />
                )}
              />
              <Controller
                control={control}
                name={`tasks.${index}.description`}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Task Description" />
                )}
              />
              <Controller
                control={control}
                name={`tasks.${index}.totalProgress`}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Total Progress"
                  />
                )}
              />
              <Controller
                control={control}
                name={`tasks.${index}.category`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-full">
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="mind">Mind</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => fields.length > 1 && remove(index)}
                className="w-full"
              >
                Remove Task
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={(val) => {
          setHasAchievement(!!val);
          if (!val) resetField("achievement", undefined);
        }}
      >
        <AccordionItem value="achievement">
          <AccordionTrigger className="font-bold">Achievement</AccordionTrigger>
          {hasAchievment && (
            <AccordionContent className="space-y-2 p-4">
              <Controller
                control={control}
                name="achievement.name"
                render={({ field }) => (
                  <Input {...field} placeholder="Achievement Name" />
                )}
              />
              <Controller
                control={control}
                name="achievement.description"
                render={({ field }) => (
                  <Input {...field} placeholder="Achievement Description" />
                )}
              />
              <Controller
                control={control}
                name="achievement.icon"
                render={({ field }) => (
                  <Input {...field} placeholder="Icon (yesicons)" />
                )}
              />
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>

      <Button type="submit">Create Quest</Button>
    </form>
  );
};

export default CreateQuestForm;
