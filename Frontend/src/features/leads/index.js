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
    const [numQuestions, setNumQuestions] = useState(5)
    const [questionType, setQuestionType] = useState("Multiple Choice")

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
        // Hook up logic here to handle API call or file parsing
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

        {/* Difficulty Level Dropdown */}
        <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty Level</label>
            <select 
                id="difficulty"
                className="select select-bordered w-full" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
            >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
            </select>
        </div>

        {/* Number of Questions Dropdown */}
        <div>
            <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">Number of Questions</label>
            <select 
                id="numQuestions"
                className="select select-bordered w-full" 
                value={numQuestions} 
                onChange={(e) => setNumQuestions(Number(e.target.value))}
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
            </select>
        </div>
        
    </div>

    <button className="btn btn-primary mt-6" onClick={generateQuestionPaper}>Generate QP</button>
</TitleCard>



        </>
    )
}


export default Leads





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