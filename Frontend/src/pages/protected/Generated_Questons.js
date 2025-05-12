import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Generated_Questions from '../../features/Generated_Questions/index'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Generated Questions"}))
      }, [])


    return(
        <Generated_Questions />
    )
}

export default InternalPage