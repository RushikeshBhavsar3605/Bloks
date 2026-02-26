"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/schemas";
import { CardWrapper } from "./card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { reset } from "@/actions/reset";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { X } from "lucide-react";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordResetLink, setPasswordResetLink] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
            toast.error(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            setIsModalOpen(true);
            setPasswordResetLink(data.resetLink);
            toast.success(data.success);
          }
        })
        .catch(() => {
          setError("Something went wrong!");
          toast.error("Something went wrong!");
        });
    });
  };

  return (
    <>
      <CardWrapper
        headerLabel="Forgot your password?"
        headerDescription="Reset the password of your Bloks account"
        backButtonLabel="Back to login"
        backButtonHref="/auth/login"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="john.doe@example.com"
                        type="email"
                        className="h-8"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={isPending} type="submit" className="w-full">
              Send reset email
            </Button>
          </form>
        </Form>
      </CardWrapper>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          {/* Close */}
          <DialogClose className="absolute right-4 top-4 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </DialogClose>

          <DialogHeader>
            <DialogTitle>Verification Info</DialogTitle>
          </DialogHeader>

          {/* Recruiter Notice */}
          <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
            Emails are not being sent because the hosting provider (Render)
            blocks outbound SMTP. The backend email flow is fully implemented
            and production-ready. For demo purposes, the verification details
            are shown below.
          </div>

          {/* Conditional Content */}
          <div className="mt-4 space-y-3">
            {passwordResetLink && (
              <div className="rounded-md border p-3 break-all">
                <p className="text-sm text-muted-foreground">
                  Password Reset Link
                </p>
                <a
                  href={passwordResetLink}
                  target="_blank"
                  className="text-primary underline"
                >
                  {passwordResetLink}
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
