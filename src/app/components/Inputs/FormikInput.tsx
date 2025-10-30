import React from "react";

interface Props {
  name:string;
  formik:any;
}
export default function FormikTextArea({name,formik}:Props) {
  return (
    <div>
     <textarea
        // as="textarea"
        name={name}
        placeholder="E.g. Hey Jen! You were amazing today. Your help is much appreciated by all. "
        className="w-full h-[220px] bg-input-bg text-600 placeholder:text-400 text-sm font-libre font-normal p-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-input-bg"
        {...formik.getFieldProps(name)}
      />
       {formik.touched[name] && formik.errors[name] && (
        <div className="text-red-500 text-sm">{formik.errors[name]}</div>
      )}

    </div>
  );
}
