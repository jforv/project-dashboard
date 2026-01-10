"use client"

import { useMemo, useState } from "react"
import { CaretDown, DotsThreeOutline, Plus } from "@phosphor-icons/react/dist/ssr"

import type { WorkstreamGroup, WorkstreamTask } from "@/lib/data/project-details"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type WorkstreamTabProps = {
  workstreams: WorkstreamGroup[] | undefined
}

export function WorkstreamTab({ workstreams }: WorkstreamTabProps) {
  const [state, setState] = useState<WorkstreamGroup[]>(() => workstreams ?? [])
  const [openValues, setOpenValues] = useState<string[]>(() =>
    workstreams && workstreams.length ? [workstreams[0].id] : [],
  )

  const allIds = useMemo(() => state.map((group) => group.id), [state])

  const toggleTask = (groupId: string, taskId: string) => {
    setState((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status: task.status === "done" ? "todo" : "done",
                    }
                  : task,
              ),
            }
          : group,
      ),
    )
  }

  if (!state.length) {
    return (
      <section>
        <h2 className="text-sm font-semibold tracking-normal text-foreground uppercase">
          WORKSTEAM BREAKDOWN
        </h2>
        <div className="mt-4 rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
          No workstreams defined yet.
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-normal text-foreground uppercase">
          WORKSTEAM BREAKDOWN
        </h2>
        <div className="flex items-center gap-1 opacity-60">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg"
            aria-label="Collapse all"
            onClick={() => setOpenValues([])}
            disabled={!allIds.length}
          >
            <CaretDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg"
            aria-label="Expand all"
            onClick={() => setOpenValues(allIds)}
            disabled={!allIds.length}
          >
            <CaretDown className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-muted/60 p-2">
        <Accordion
          type="multiple"
          value={openValues}
          onValueChange={(values) =>
            setOpenValues(Array.isArray(values) ? values : values ? [values] : [])
          }
        >
          {state.map((group) => (
            <AccordionItem
              key={group.id}
              value={group.id}
              className="mb-2 overflow-hidden rounded-xl border border-border bg-background last:mb-0"
            >
              <AccordionTrigger className="border-b border-border bg-background">
                <div className="flex flex-1 items-center gap-3">
                  <CaretDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1 truncate text-left text-sm font-medium text-foreground">
                    {group.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Button asChild size="icon-sm" variant="ghost" className="size-6 rounded-md">
                      <span
                        role="button"
                        aria-label="Add task"
                        onClick={(event) => {
                          // Prevent toggling the accordion when clicking the add icon.
                          event.stopPropagation()
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <GroupSummary group={group} />
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="bg-background/60">
                <div className="space-y-1 py-2">
                  {group.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={() => toggleTask(group.id, task.id)} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

type GroupSummaryProps = {
  group: WorkstreamGroup
}

function GroupSummary({ group }: GroupSummaryProps) {
  const total = group.tasks.length
  const done = group.tasks.filter((t) => t.status === "done").length

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {done}/{total}
      </span>
      <div className="relative flex h-4 w-4 items-center justify-center rounded-full border border-border/70 bg-muted">
        <div
          className="h-3 w-3 rounded-full bg-primary/70"
          style={{ clipPath: `inset(${100 - (total ? (done / total) * 100 : 0)}% 0 0 0)` }}
        />
      </div>
    </div>
  )
}

type TaskRowProps = {
  task: WorkstreamTask
  onToggle: () => void
}

function TaskRow({ task, onToggle }: TaskRowProps) {
  const isDone = task.status === "done"

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/60">
      <Checkbox checked={isDone} onCheckedChange={onToggle} aria-label={task.name} />
      <span
        className={cn(
          "flex-1 truncate text-left",
          isDone && "line-through text-muted-foreground",
        )}
      >
        {task.name}
      </span>
      <div className="flex items-center gap-3 text-xs">
        {task.dueLabel && (
          <span
            className={cn(
              "text-muted-foreground",
              task.dueTone === "danger" && "text-red-500",
              task.dueTone === "warning" && "text-amber-500",
            )}
          >
            {task.dueLabel}
          </span>
        )}
        {task.assignee && (
          <Avatar className="size-7">
            {task.assignee.avatarUrl && (
              <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
            )}
            <AvatarFallback>{task.assignee.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="size-7 rounded-md text-muted-foreground"
          aria-label="More actions"
        >
          <DotsThreeOutline className="h-4 w-4" weight="bold" />
        </Button>
      </div>
    </div>
  )
}
