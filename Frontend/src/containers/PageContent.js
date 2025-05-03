import Header from "./Header"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import routes from '../routes'
import { Suspense, lazy } from 'react'
import SuspenseContent from "./SuspenseContent"
import { useSelector } from 'react-redux'
import { useEffect, useRef } from "react"

const Page404 = lazy(() => import('../pages/protected/404'))


function PageContent({ userRole }){
    const mainContentRef = useRef(null);
    const {pageTitle} = useSelector(state => state.header)
    const filteredRoutes = routes.filter(route => {
        // Hide dashboard for Teachers
        if (route.path === "/dashboard" && userRole === "Teacher") return false;
        // Hide /users for Teachers
        if (route.path === "/Users" && userRole === "Teacher") return false;
        // Hide /Upload-Books for Teachers
        if (route.path === "/Users/view-book" && userRole === "Teacher") return false;
        // Hide /userBooks for Admin
        return true;
    });

    // Scroll back to top on new page load
    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
          });
      }, [pageTitle])

    return(
        <div className="drawer-content flex flex-col ">
            <Header/>
            <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6  bg-base-200" ref={mainContentRef}>
                <Suspense fallback={<SuspenseContent />}>
                        <Routes>
                            {
                                 filteredRoutes.map((route, key) => {
                                    return(
                                        <Route
                                        key={key}
                                        path={route.path}
                                        element={<route.component />}
                                        />
                                    )
                                })
                            }

                            {/* Redirecting unknown url to 404 page */}
                            <Route path="*" element={<Page404 />} />
                        </Routes>
                </Suspense>
                <div className="h-16"></div>
            </main>
        </div> 
    )
}


export default PageContent
