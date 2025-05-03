import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ViewBooks from '../../features/integration'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "My Books" }))
      }, [])
      
    return(
        <ViewBooks />
    )
}

export default InternalPage