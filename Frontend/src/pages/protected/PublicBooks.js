import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import PublicBooks from '../../features/publicBooks'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Public Books" }))
      }, [])
      
    return(
        <PublicBooks/>
    )
}

export default InternalPage