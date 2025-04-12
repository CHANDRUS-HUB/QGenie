import { useState } from "react"


function InputText({labelTitle, labelStyle, type, containerStyle, defaultValue, placeholder, updateFormValue, updateType,Oncustomchange}){

    const [value, setValue] = useState(defaultValue)

    const updateInputValue = (val, event) => {
        setValue(val)
        updateFormValue({updateType, value : val})
    
      // Call external onChange if provided
      if (Oncustomchange) {
        Oncustomchange(event) // 👈 pass the original event for validation
      }
    }

    return(
        <div className={`form-control w-full ${containerStyle}`}>
            <label className="label">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
            </label>
            <input type={type || "text"} value={value} placeholder={placeholder || ""} onChange={(e) => updateInputValue(e.target.value,e)} className="input  input-bordered w-full " />
        </div>
    )
}


export default InputText