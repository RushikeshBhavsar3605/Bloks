"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";
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
import { login } from "@/actions/login";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { X } from "lucide-react";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError =
    searchParams?.get("error") === "OAuthAccountNotLinked" ? true : false;

  if (urlError) {
    router.push("/auth/error?error=OAuthAccountNotLinked");
  }

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>();
  const [confirmLink, setConfirmLink] = useState<string>();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
            toast.error(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            if (data.confirmLink) {
              setTwoFactorCode(undefined);
              setIsModalOpen(true);
              setConfirmLink(data.confirmLink);
            }
            toast.success(data.success);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
            setIsModalOpen(true);
            setConfirmLink(undefined);
            setTwoFactorCode(data.code);
            toast.success("Enter Two-Factor Code");
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
        headerLabel={!showTwoFactor ? "Sign in" : "Two-Factor Verification"}
        headerDescription={
          !showTwoFactor
            ? "Log in to your Bloks account"
            : "Enter the 6-digit code received on your email"
        }
        backButtonLabel="Don't have an account?"
        backButtonHref="/auth/register"
        showSocial={!showTwoFactor ? true : false}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              {showTwoFactor && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Two Factor Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="123456"
                          className="h-8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!showTwoFactor && (
                <>
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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="******"
                            type="password"
                            className="h-8"
                          />
                        </FormControl>
                        <Button
                          size="sm"
                          variant="link"
                          asChild
                          className="px-0 font-normal"
                        >
                          <Link href="/auth/reset">Forgot password?</Link>
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <Button disabled={isPending} type="submit" className="w-full">
              {showTwoFactor ? "Confirm" : "Continue"}
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
            {twoFactorCode && (
              <div className="rounded-md border p-3">
                <p className="text-sm text-muted-foreground">2FA Code</p>
                <p className="font-mono text-lg font-semibold">
                  {twoFactorCode}
                </p>
              </div>
            )}

            {confirmLink && (
              <div className="rounded-md border p-3 break-all">
                <p className="text-sm text-muted-foreground">
                  Confirmation Link
                </p>
                <a
                  href={confirmLink}
                  target="_blank"
                  className="text-primary underline"
                >
                  {confirmLink}
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
