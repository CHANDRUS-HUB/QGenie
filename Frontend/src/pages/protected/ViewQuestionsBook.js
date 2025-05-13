import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ViewQuestionsBook from '../../features/ViewQuestionsBook'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "User Questions" }))
      }, [])
      
    return(
        <ViewQuestionsBook/>
    )
}

export default InternalPage