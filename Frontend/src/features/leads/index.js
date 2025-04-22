import moment from "moment"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import TitleCard from "../../components/Cards/TitleCard"
import { openModal } from "../common/modalSlice"
import { deleteLead, getLeadsContent } from "./leadSlice"
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import { showNotification } from '../common/headerSlice'
import { useState } from "react"
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'

const TopSideButtons = () => {

    const dispatch = useDispatch()

    const openAddNewLeadModal = () => {
        dispatch(openModal({title : "Add New Lead", bodyType : MODAL_BODY_TYPES.LEAD_ADD_NEW}))
    }

    return(
        <div className="inline-block float-right">
            <button className="btn px-6 btn-sm normal-case btn-primary" onClick={() => openAddNewLeadModal()}>Add New</button>
        </div>
    )
}

function Leads(){

    const {leads } = useSelector(state => state.lead)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getLeadsContent())
    }, [])

        const difficultyOptions = [
        { label: "Easy", color: "bg-green-100 border-green-400" },
        { label: "Medium", color: "bg-yellow-100 border-yellow-400" },
        { label: "Hard", color: "bg-red-100 border-red-400" },
    ]

    const getDummyStatus = (index) => {
        if(index % 5 === 0)return <div className="badge">Not Interested</div>
        else if(index % 5 === 1)return <div className="badge badge-primary">In Progress</div>
        else if(index % 5 === 2)return <div className="badge badge-secondary">Sold</div>
        else if(index % 5 === 3)return <div className="badge badge-accent">Need Followup</div>
        else return <div className="badge badge-ghost">Open</div>
    }

    const deleteCurrentLead = (index) => {
        dispatch(openModal({title : "Confirmation", bodyType : MODAL_BODY_TYPES.CONFIRMATION, 
        extraObject : { message : `Are you sure you want to delete this lead?`, type : CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE, index}}))
    }





    const [file, setFile] = useState(null)
    const [subject, setSubject] = useState("")
    const [topic, setTopic] = useState("")
    const [type, setType] = useState("Objective")
    const [difficulty, setDifficulty] = useState("Easy")
   
    const [questionType, setQuestionType] = useState("Multiple Choice")
    const [numQuestions, setNumQuestions] = useState({ Easy: 5, Medium: 5, Hard: 5 })

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setFile(e.dataTransfer.files[0])
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const generateQuestionPaper = () => {
        console.log({
            file,
            subject,
            topic,
            type,
            difficulty,
            numQuestions,
            questionType
        })
        alert("Question Paper Generation Triggered!")
    }











    return(
        <>
            
           

<TitleCard title="Please select a file (Accepted types: .doc, .pdf, .txt)"  topMargin="mt-6">
    <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition" 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
        {
            file ? (
                <div className="text-sm text-gray-600">File Uploaded: <strong>{file.name}</strong></div>
            ) : (
                <>
                    <InboxArrowDownIcon className="mx-auto h-12 w-12 text-gray-400"/>
                    <p className="mt-2 text-sm text-gray-500">Drag & drop file here or</p>
                    <input type="file" className="mt-2" onChange={handleFileChange}/>
                </>
            )
        }
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        
        {/* Subject Input */}
        <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input 
                id="subject"
                type="text" 
                className="input input-bordered w-full" 
                placeholder="Subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
        </div>
        
        {/* Topic Input */}
        <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
            <input 
                id="topic"
                type="text" 
                className="input input-bordered w-full" 
                placeholder="Topic" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />
        </div>

        {/* Question Type Dropdown */}
        <div>
            <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">Question Type</label>
            <select 
                id="questionType" 
                className="select select-bordered w-full" 
                value={questionType} 
                onChange={(e) => setQuestionType(e.target.value)}
            >
                <option>Multiple Choice</option>
                <option>Fill in the Blanks</option>
                <option>True/False</option>
                <option>Short Answer</option>
            </select>
        </div>

   
        <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Select Difficulty Level & Set Question Count</label>
    <div className="flex flex-wrap gap-4">
        {difficultyOptions.map((option) => (
            <div
                key={option.label}
                className={`cursor-pointer  rounded-lg px-3 py-1 w-48 transition-all duration-200
                    ${option.color}
                   
                `}
                onClick={() => setDifficulty(option.label)}
            >
                <div className="text-center font-semibold mb-2">{option.label}</div>
                <input
                    type="number"
                    min={1}
                    value={numQuestions[option.label]}
                    onClick={(e) => e.stopPropagation()} // prevent card from being selected when clicking input
                    onChange={(e) => {
                        const updated = { ...numQuestions, [option.label]: Number(e.target.value) }
                        setNumQuestions(updated)
                    }}
                    className="input input-bordered w-full"
                />
                {/* <div className="text-xs text-gray-600 mt-1 text-center">Questions</div> */}
            </div>
        ))}
    </div>
</div>
        
    </div>

    <button className="btn btn-primary mt-6" onClick={generateQuestionPaper}>Generate QP</button>
</TitleCard>



        </>
    )
}


export default Leads















// function Leads() {
//     const { leads } = useSelector(state => state.lead)
//     const dispatch = useDispatch()

//     useEffect(() => {
//         dispatch(getLeadsContent())
//     }, [])

//     const [file, setFile] = useState(null)
//     const [subject, setSubject] = useState("")
//     const [topic, setTopic] = useState("")
//     const [type, setType] = useState("Objective")
//     const [difficulty, setDifficulty] = useState("Easy")
   
//     const [questionType, setQuestionType] = useState("Multiple Choice")
//     const [numQuestions, setNumQuestions] = useState({ Easy: 5, Medium: 5, Hard: 5 })

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0])
//     }

//     const handleDrop = (e) => {
//         e.preventDefault()
//         setFile(e.dataTransfer.files[0])
//     }

//     const handleDragOver = (e) => {
//         e.preventDefault()
//     }

//     const generateQuestionPaper = () => {
//         console.log({
//             file,
//             subject,
//             topic,
//             type,
//             difficulty,
//             numQuestions,
//             questionType
//         })
//         alert("Question Paper Generation Triggered!")
//     }

//     const difficultyOptions = [
//         { label: "Easy", color: "bg-green-100 border-green-400" },
//         { label: "Medium", color: "bg-yellow-100 border-yellow-400" },
//         { label: "Hard", color: "bg-red-100 border-red-400" },
//     ]

//     return (
//         <>
//             <TitleCard title="Please select a file (Accepted types: .doc, .pdf, .txt)" topMargin="mt-6">
//                 <div
//                     className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
//                     onDrop={handleDrop}
//                     onDragOver={handleDragOver}
//                 >
//                     {file ? (
//                         <div className="text-sm text-gray-600">File Uploaded: <strong>{file.name}</strong></div>
//                     ) : (
//                         <>
//                             <InboxArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
//                             <p className="mt-2 text-sm text-gray-500">Drag & drop file here or</p>
//                             <input type="file" className="mt-2" onChange={handleFileChange} />
//                         </>
//                     )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//                     {/* Subject Input */}
//                     <div>
//                         <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
//                         <input
//                             id="subject"
//                             type="text"
//                             className="input input-bordered w-full"
//                             placeholder="Subject"
//                             value={subject}
//                             onChange={(e) => setSubject(e.target.value)}
//                         />
//                     </div>

//                     {/* Topic Input */}
//                     <div>
//                         <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
//                         <input
//                             id="topic"
//                             type="text"
//                             className="input input-bordered w-full"
//                             placeholder="Topic"
//                             value={topic}
//                             onChange={(e) => setTopic(e.target.value)}
//                         />
//                     </div>

                
                 
//                     <div className="md:col-span-2">
//     <label className="block text-sm font-medium text-gray-700 mb-2">Select Difficulty Level & Set Question Count</label>
//     <div className="flex flex-wrap gap-4">
//         {difficultyOptions.map((option) => (
//             <div
//                 key={option.label}
//                 className={`cursor-pointer border rounded-lg px-3 py-1 w-48 transition-all duration-200
//                     ${option.color}
//                     ${difficulty === option.label ? "ring-2 ring-offset-2 ring-gray-600" : "opacity-90"}
//                 `}
//                 onClick={() => setDifficulty(option.label)}
//             >
//                 <div className="text-center font-semibold mb-2">{option.label}</div>
//                 <input
//                     type="number"
//                     min={1}
//                     value={numQuestions[option.label]}
//                     onClick={(e) => e.stopPropagation()} // prevent card from being selected when clicking input
//                     onChange={(e) => {
//                         const updated = { ...numQuestions, [option.label]: Number(e.target.value) }
//                         setNumQuestions(updated)
//                     }}
//                     className="input input-bordered w-full"
//                 />
//                 {/* <div className="text-xs text-gray-600 mt-1 text-center">Questions</div> */}
//             </div>
//         ))}
//     </div>
// </div>

                 
                  

          
//                 </div>

//                 <button className="btn btn-primary mt-6" onClick={generateQuestionPaper}>Generate QP</button>
//             </TitleCard>
//         </>
//     )
// }

// export default Leads




 {/* <TitleCard title="Current Leads" topMargin="mt-2" TopSideButtons={<TopSideButtons />}>

            <div className="overflow-x-auto w-full">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email Id</th>
                        <th>Created At</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            leads.map((l, k) => {
                                return(
                                    <tr key={k}>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img src={l.avatar} alt="Avatar" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{l.first_name}</div>
                                                <div className="text-sm opacity-50">{l.last_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{l.email}</td>
                                    <td>{moment(new Date()).add(-5*(k+2), 'days').format("DD MMM YY")}</td>
                                    <td>{getDummyStatus(k)}</td>
                                    <td>{l.last_name}</td>
                                    <td><button className="btn btn-square btn-ghost" onClick={() => deleteCurrentLead(k)}><TrashIcon className="w-5"/></button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            </TitleCard> */}