import { useState } from "react"


function InputText({ labelTitle, labelStyle, type, containerStyle, value, placeholder, updateFormValue, updateType, Oncustomchange , readOnly , disabled }) {
    const updateInputValue = (val, event) => {
        updateFormValue({ updateType, value: val });

        if (Oncustomchange) {
            Oncustomchange(event);
        }
    };

    return (
        <div className={`form-control w-full ${containerStyle}`}>
            <label className="label">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
            </label>
            <input
               readOnly={readOnly || false}
               disabled={disabled || false}
                type={type || "text"}
                value={value || ""}
                placeholder={placeholder || ""}
                onChange={(e) => updateInputValue(e.target.value, e)}
                className="input input-bordered w-full"
            />
        </div>
    );
}



export default InputText