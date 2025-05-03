import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ViewBooks from '../../features/ViewBooks'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "User Books" }))
      }, [])
      
    return(
        <ViewBooks/>
    )
}

export default InternalPage