"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  messageSchema,
  MessageSchema,
} from "@/lib/formValidationSchemas";
import {
  createMessage,
  updateMessage,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface MessageFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const MessageForm = ({ type, data, setOpen, relatedData }: MessageFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
  });

  // Use the appropriate action based on the form type
  const [state, formAction] = useFormState(
    type === "create" ? createMessage : updateMessage,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    // Create a new FormData instance
    const formData = new FormData();

    // Append each key-value pair from the plain object.
    // Be sure to convert non-string values (like Dates) to strings.
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
        formData.append(key, value.toISOString());
        } else if (typeof value === "object" && value !== null) {
        // For objects, you might want to convert to JSON
        formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
        }
    });

    // Now pass the FormData to the formAction
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Message has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // If the form needs additional data, e.g. for the recipient options,
  // you could pass an array named 'recipients' via relatedData.
  const recipients = relatedData?.recipients || [
    { value: "all", label: "All" },
    { value: "students", label: "Students" },
    { value: "teachers", label: "Teachers" },
    { value: "parents", label: "Parents" },
    { value: "students_parents", label: "Students & Parents" },
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new message"
          : "Update the message"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Message Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <InputField
          label="Content"
          name="content"
          defaultValue={data?.content}
          register={register}
          error={errors?.content}
          type="textarea"
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Recipient</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("recipient", { required: "Recipient is required!" })}
            defaultValue={data?.recipient || ""}
          >
            <option value="" disabled>
              Select a recipient
            </option>
            {recipients.map((option: { value: string; label: string }) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.recipient?.message && (
            <p className="text-xs text-red-400">
              {errors.recipient.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default MessageForm;
