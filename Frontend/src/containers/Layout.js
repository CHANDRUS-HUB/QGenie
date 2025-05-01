import PageContent from "./PageContent"
import LeftSidebar from "./LeftSidebar"


function Layout({ userRole }){

 


    return(
      <>
        { /* Left drawer - containing page content and side bar (always open) */ }
        <div className="drawer">
            <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
            <PageContent  userRole={userRole}  />
            <LeftSidebar   userRole={userRole} />
        </div>

       

      </>
    )
}

export default Layout

// import RightSidebar from './RightSidebar'
// import { useEffect } from "react"
// import  {  removeNotificationMessage } from "../features/common/headerSlice"
// import {NotificationContainer, NotificationManager} from 'react-notifications';
// import 'react-notifications/lib/notifications.css';
// import ModalLayout from "./ModalLayout"

 // const {newNotificationMessage, newNotificationStatus} = useSelector(state => state.header)


// useEffect(() => {
//   if(newNotificationMessage !== ""){
//       if(newNotificationStatus === 1)NotificationManager.success(newNotificationMessage, 'Success')
//       if(newNotificationStatus === 0)NotificationManager.error( newNotificationMessage, 'Error')
//       dispatch(removeNotificationMessage())
//   }
// }, [newNotificationMessage])

// { /* Right drawer - containing secondary content like notifications list etc.. */ }
// <RightSidebar />


// {/** Notification layout container */}
// <NotificationContainer />

// {/* Modal layout container */}
// <ModalLayout />