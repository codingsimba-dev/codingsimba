import type { Route } from "./+types/change-photo";
import React from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/auth.server";
import { data, Form, Link } from "react-router";
import { FormError } from "~/components/form-errors";
import { Button } from "~/components/ui/button";
import { Loader, Loader2 } from "lucide-react";
import { GradientContainer } from "~/components/gradient-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardFooter,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "~/components/ui/card";
import { getImgSrc, getInitials, getSeed, useIsPending } from "~/utils/misc";
import { parseFormData } from "@mjackson/form-data-parser";
import { StatusCodes } from "http-status-codes";
import { generateMetadata } from "~/utils/meta";
import {
  deleteFileFromStorage,
  uploadFIleToStorage,
} from "~/utils/storage.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";
import { redirectWithToast } from "~/utils/toast.server";

const MAX_SIZE = 1024 * 1024 * 3; // 3MB
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const DeleteImageSchema = z.object({
  intent: z.literal("delete"),
});

const NewImageSchema = z.object({
  intent: z.literal("submit"),
  photoFile: z
    .instanceof(File)
    .refine(
      (file) => allowedTypes.includes(file.type),
      "Only JPG, PNG, or WEBP images are allowed",
    )
    .refine((file) => file.size > 0, "Image is required")
    .refine(
      (file) => file.size <= MAX_SIZE,
      "Image size must be less than 3MB",
    ),
});

const PhotoFormSchema = z.discriminatedUnion("intent", [
  DeleteImageSchema,
  NewImageSchema,
]);

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: { select: { fileKey: true, altText: true } },
    },
  });
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await parseFormData(request, { maxFileSize: MAX_SIZE });
  await checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: PhotoFormSchema.transform(async (data, ctx) => {
      if (data.intent === "delete") {
        const file = await prisma.image.findFirst({
          where: { userId },
          select: { fileKey: true },
        });
        const response = await deleteFileFromStorage({
          path: "users",
          fileKey: file!.fileKey,
        });
        if (response.status !== "success") {
          ctx.addIssue({
            path: ["photoFile"],
            code: z.ZodIssueCode.custom,
            message: response.error as string,
          });
          return z.NEVER;
        }
        return { intent: "delete" };
      }
      if (data.photoFile.size <= 0) return z.NEVER;
      const { photoFile, intent } = data;
      const response = await uploadFIleToStorage({
        path: "users",
        file: data.photoFile,
      });

      if (response.status !== "success") {
        ctx.addIssue({
          path: ["photoFile"],
          code: z.ZodIssueCode.custom,
          message: response.error as string,
        });
        return z.NEVER;
      }
      return {
        intent,
        image: {
          fileKey: photoFile.name,
        },
      };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return data(
      { ...submission.reply() },
      {
        status:
          submission.status === "error"
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.OK,
      },
    );
  }

  const MOCKS = process.env.MOCKS;
  const { image, intent } = submission.value;

  if (intent === "delete") {
    if (!MOCKS) {
      await prisma.image.deleteMany({ where: { userId } });
    }
    return redirectWithToast("/profile", {
      title: `Profile picture removed`,
      description: "You have successfully deleted your profile picture",
      type: "success",
    });
  }

  if (!MOCKS) {
    await prisma.$transaction(async ($prisma) => {
      await $prisma.image.deleteMany({ where: { userId } });
      await $prisma.user.update({
        where: { id: userId },
        data: { image: { create: image } },
      });
    });
  }
  return redirectWithToast("/profile", {
    title: `Profile picture update`,
    description: "You have successfully updated your profile picture",
    type: "success",
  });
}

export default function ChangePhoto({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Change Profile Image" });
  const user = loaderData.user;
  const isSubmitting = useIsPending();

  const [form, fields] = useForm({
    id: "change-image",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PhotoFormSchema });
    },
    shouldValidate: "onBlur",
  });
  const [newImageSrc, setNewImageSrc] = React.useState<string | null>(null);

  return (
    <>
      {metadata}
      <GradientContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-full max-w-md"
        >
          <Card className="bg-card/80 w-full shadow-xl backdrop-blur-sm">
            <Form
              method="POST"
              encType="multipart/form-data"
              onReset={() => setNewImageSrc(null)}
              {...getFormProps(form)}
              className="mx-auto w-full space-y-6"
            >
              <HoneypotInputs />
              <CardHeader>
                <CardTitle>Update Profile Image</CardTitle>
                <CardDescription>
                  Update your profile picture or delete the current one.
                  Supported formats: JPG, PNG, WEBP (Max 3MB).
                </CardDescription>
              </CardHeader>
              <CardContent className="my-8">
                <Avatar className="border-border mx-auto mt-4 size-48 border">
                  <AvatarImage
                    src={
                      newImageSrc ??
                      getImgSrc({
                        path: "users",
                        seed: getSeed(user.name),
                        fileKey: user.image?.fileKey,
                      })
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className="text-3xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <FormError errors={fields.photoFile.errors} />
                <div className="flex gap-4">
                  <input
                    {...getInputProps(fields.photoFile, { type: "file" })}
                    accept="image/*"
                    className="peer sr-only"
                    required
                    tabIndex={newImageSrc ? -1 : 0}
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewImageSrc(
                            event.target?.result?.toString() ?? null,
                          );
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-evenly">
                  <Link to={"/profile"}>
                    <Button variant={"outline"}>Cancel</Button>
                  </Link>
                  {newImageSrc ? (
                    <Button variant="destructive" type="reset">
                      Reset
                    </Button>
                  ) : null}

                  {user.image ? (
                    <Button
                      variant={"destructive"}
                      type="submit"
                      name="intent"
                      value="delete"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader className="mr-1 size-4 animate-spin" />
                      ) : null}{" "}
                      Delete
                    </Button>
                  ) : null}
                  {newImageSrc ? (
                    <Button
                      name="intent"
                      value="submit"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Save{" "}
                      {isSubmitting ? (
                        <Loader2 className="ml-2 animate-spin" />
                      ) : null}
                    </Button>
                  ) : (
                    <Button
                      name="intent"
                      value="submit"
                      type="submit"
                      disabled={isSubmitting}
                      asChild
                    >
                      <label htmlFor={fields.photoFile.id}>Change </label>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Form>
          </Card>
        </motion.div>
      </GradientContainer>
    </>
  );
}
