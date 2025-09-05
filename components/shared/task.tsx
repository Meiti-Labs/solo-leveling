"use client";

import { ITask } from "@/models/quest.model";
import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { Poppins } from "next/font/google";
import { useHoldRepeat } from "@/hooks/useHoldRepeat"; // <-- path to the hook
import ApiService from "@/utils/ApiService";
import { userStore } from "@/store/userStore";

const FontPoppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "500",
});

const data = [
  {
    goal: 400,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 239,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 349,
  },
];

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const Task: React.FunctionComponent<ITask & { questId: string }> = (task) => {
  // You had both totalProgress and fixed min/max; pick what you want to clamp to.
  // Here I keep your visible limits 200–400, but you can switch to task.totalProgress if desired.
  const MIN = 0;
  const MAX = task.totalProgress;

  const [goal, setGoal] = React.useState(task.doneProgress || 0);
  const { quests, updateQuests } = userStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isClosed, setIsClosed] = React.useState(task.isCompleted || false);

  const dec = React.useCallback(() => {
    setGoal((g) => clamp(g - 1, MIN, MAX));
  }, []);
  const inc = React.useCallback(() => {
    setGoal((g) => clamp(g + 1, MIN, MAX));
  }, []);

  const decBind = useHoldRepeat({
    onTrigger: dec,
    fireImmediately: true,
    initialDelay: 250,
    repeatDelay: 60,
    disabled: goal <= MIN,
  });

  const incBind = useHoldRepeat({
    onTrigger: inc,
    fireImmediately: true,
    initialDelay: 250,
    repeatDelay: 60,
    disabled: goal >= MAX,
  });

  const handleUpdateProgress = () => {
    const payload = {
      questId: task.questId,
      taskId: task._id,
      progress: goal,
    };
    setIsLoading(true);
    ApiService.put("/user/quests/update-progress", payload)
      .then((res) => {
        if (res.success) {
          updateQuests(
            quests?.map((quest) => {
              if (quest._id !== task.questId) return quest;
              return {
                ...quest,
                tasks: quest.tasks.map((t) => {
                  if (t._id !== task._id) return t;
                  return { ...t, doneProgress: goal };
                }),
              };
            }) || []
          );
          if (goal >= task.totalProgress) {
            setIsClosed(true);
          }
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex justify-between text-sm mt-10 text-white text-shadow-2xs text-shadow-white items-center my-5 cursor-pointer">
          <div>{task.title}</div>
          <div className="flex items-center gap-5">
            <span>
              [{task.doneProgress || 0}/ {task.totalProgress}]
            </span>
            <input type="checkbox" checked={isClosed} />
          </div>
        </div>
      </DrawerTrigger>

      <DrawerContent className={`${FontPoppins.className}`}>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            {!isClosed ? (
              <>
                <DrawerTitle>Move Progress</DrawerTitle>
                <DrawerDescription>
                  Set your Progress on this task.
                </DrawerDescription>
              </>
            ) : (
              <DrawerTitle>Task Completed</DrawerTitle>
            )}
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                {...decBind}
                disabled={goal <= MIN || isClosed}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>

              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">
                  {goal}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                {...incBind}
                disabled={goal >= MAX || isClosed}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>

            <div className="mt-3 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Bar
                    dataKey="goal"
                    style={
                      {
                        fill: "hsl(var(--foreground))",
                        opacity: 0.9,
                      } as React.CSSProperties
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DrawerFooter>
            <Button
              disabled={isLoading || isClosed}
              onClick={handleUpdateProgress}
            >
              Submit
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Task;
