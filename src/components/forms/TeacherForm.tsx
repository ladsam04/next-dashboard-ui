"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    // You can also initialize defaultValues here if preferred.
  });

  // Local state for image preview.
  const [img, setImg] = useState<any>();

  // For form actions (create or update)
  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  // When updating a record, initialize the image state with the saved image.
  useEffect(() => {
    if (data && data.img) {
      setImg(data.img);
    }
  }, [data]);

  const onSubmit = handleSubmit((formData) => {
    console.log("Form data submitted:", formData);
    // Pass along the image URL from our local state, if it exists.
    formAction({ ...formData, img: img ? img : undefined });
  });

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Destructure subjects from relatedData (and similarly, classes)
  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={""} // Always keep the password field empty for security.
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>

      {/* Image Preview Section */}
      <div className="flex flex-col gap-2">
        {img ? (
          <div className="mb-4">
            <Image
              src={img}
              alt="Teacher's picture"
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <>
            {data?.img && (
              <div className="mb-4">
                <Image
                  src={data.img}
                  alt="Teacher's picture"
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </>
        )}
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="Upload" width={28} height={28} />
                <span>Upload a photo</span>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday ? data.birthday.toISOString().split("T")[0] : ""}
          register={register}
          error={errors.birthday}
          type="date"
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
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>

        {/* Subjects - multi-select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjects")}
            defaultValue={
              data?.subjects
                ? data.subjects.map((subject: { id: number }) => subject.id.toString())
                : []
            }
          >
            <option disabled>Select one or more subjects</option>
            {subjects &&
              subjects.map((subject: { id: number; name: string }) => (
                <option value={subject.id.toString()} key={subject.id}>
                  {subject.name}
                </option>
              ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>

        {/* Classes - multi-select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Classes</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classIds")}
            defaultValue={
              data?.classIds
                ? data.classIds.map((id: number) => id.toString())
                : data?.classes
                ? data.classes.map((cls: { id: number }) => cls.id.toString())
                : []
            }
          >
            <option disabled>Select one or more classes</option>
            {relatedData?.classes &&
              relatedData.classes.map((cls: { id: number; name: string }) => (
                <option value={cls.id.toString()} key={cls.id}>
                  {cls.name}
                </option>
              ))}
          </select>
          {errors.classIds && (
            <p className="text-xs text-red-400">
              {errors.classIds?.message?.toString() ?? ""}
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

export default TeacherForm;
