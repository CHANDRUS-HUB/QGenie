import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import QA_Generation from '../../features/QA_Generation'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Q&A Generation" }))
      }, [])
      
    return(
        <QA_Generation/>
    )
}

export default InternalPage