"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AttendanceForm = ({
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      // If there's no provided data, default to false so the field is defined.
      date: data?.date,
      present: data?.present ?? false,
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || undefined,
    }
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students, lessons } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new attendance record" : "Update the attendance record"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date}
          register={register}
          error={errors?.date}
          type="date"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
        <label className="text-xs text-gray-500">Present</label>
        <Controller
          name="present"
          control={control}
          defaultValue={data?.present ?? false} // default value is a boolean
          rules={{ required: "Attendance status is required!" }}
          render={({ field }) => (
            <select
              {...field}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              // Set the value as string for the select element
              value={field.value ? "true" : "false"}
              onChange={(e) =>
                field.onChange(e.target.value === "true") // convert string to boolean
              }
            >
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          )}
        />
        {errors.present && (
          <p className="text-xs text-red-400">
            {errors.present.message?.toString()}
          </p>
        )}
      </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId", { required: "Student is required!" })}
            defaultValue={data?.studentId}
          >
            <option disabled>Select a student</option>
            {students &&
              students.map((student: { id: string; name: string; surname: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name} {student.surname}
                </option>
              ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId", { required: "Lesson is required!" })}
            defaultValue={data?.lessonId}
          >
            <option disabled>Select a lesson</option>
            {lessons &&
              lessons.map((lesson: { id: number; name: string }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.name}
                </option>
              ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">{errors.lessonId.message.toString()}</p>
          )}
        </div>
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;
