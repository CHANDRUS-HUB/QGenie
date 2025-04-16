// components/GlobalNotification.jsx
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react"
import { removeNotificationMessage } from "../features/common/headerSlice"
import { NotificationContainer, NotificationManager } from 'react-notifications'

const GlobalNotification = () => {
  const dispatch = useDispatch()
  const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header)

  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success')
      if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error')
      dispatch(removeNotificationMessage())
    }
  }, [newNotificationMessage])

  return <NotificationContainer />
}

export default GlobalNotification
